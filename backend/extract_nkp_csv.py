import csv
import os
import re
import socket
import time
from datetime import datetime

import requests
from bs4 import BeautifulSoup


# ============================================================
# CONFIG
# ============================================================

BASE_URL = "https://nkp.gov.np/full_detail/{}"

START_ID = 0
END_ID = 11520

OUTPUT_DIR = os.path.expanduser("~/nkp_data/csv")
STATE_FILE = os.path.expanduser("~/nkp_data/csv/crawl_state.txt")
FAILED_FILE = os.path.expanduser("~/nkp_data/csv/failed_ids.csv")

BATCH_SIZE = 100

REQUEST_TIMEOUT = 30
REQUEST_DELAY = 2

# If internet/DNS disappears, keep waiting instead of
# permanently marking those IDs as failed.
NETWORK_WAIT = 30

MAX_RETRIES = 3


# ============================================================
# CREATE OUTPUT DIRECTORY
# ============================================================

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ============================================================
# HTTP SESSION
# ============================================================

session = requests.Session()

session.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/150.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,"
        "application/xml;q=0.9,*/*;q=0.8"
    ),
    "Accept-Language": "ne-NP,ne;q=0.9,en-US;q=0.8,en;q=0.7",
})


# ============================================================
# NETWORK CHECK
# ============================================================

def network_available():

    try:
        socket.gethostbyname("nkp.gov.np")
        return True

    except Exception:
        return False


# ============================================================
# CLEAN ONLY WEBSITE/HTML JUNK
#
# IMPORTANT:
# The actual legal wording is NOT rewritten.
# ============================================================

def clean_legal_content(container):

    # Work on a copy so the original soup remains untouched.
    container = BeautifulSoup(
        str(container),
        "html.parser"
    )

    # --------------------------------------------------------
    # Remove elements which cannot be legal text.
    # --------------------------------------------------------

    for tag in container.find_all([
        "script",
        "style",
        "noscript",
        "iframe",
        "svg",
        "canvas",
        "video",
        "audio",
        "form",
        "button",
        "input",
        "select",
        "textarea",
    ]):
        tag.decompose()

    # --------------------------------------------------------
    # Remove obvious website navigation elements.
    # --------------------------------------------------------

    for tag in container.find_all([
        "nav",
        "footer",
        "header",
    ]):
        tag.decompose()

    # --------------------------------------------------------
    # Preserve paragraph/line structure.
    #
    # We use newline separators instead of simply joining
    # everything with spaces.
    # --------------------------------------------------------

    text = container.get_text(
        separator="\n",
        strip=False
    )

    # --------------------------------------------------------
    # Normalize line endings only.
    # --------------------------------------------------------

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove non-breaking spaces.
    text = text.replace("\xa0", " ")

    # --------------------------------------------------------
    # Remove trailing spaces from individual lines.
    # Do NOT modify the actual words.
    # --------------------------------------------------------

    lines = []

    for line in text.split("\n"):

        line = line.rstrip()

        if line.strip():
            lines.append(line)

        else:
            # Keep paragraph separation.
            if lines and lines[-1] != "":
                lines.append("")

    # --------------------------------------------------------
    # Remove excessive blank lines.
    # --------------------------------------------------------

    cleaned = "\n".join(lines)

    cleaned = re.sub(
        r"\n{3,}",
        "\n\n",
        cleaned
    )

    return cleaned.strip()


# ============================================================
# FIND LEGAL CONTENT
# ============================================================

def extract_legal_content(soup):

    # --------------------------------------------------------
    # PRIMARY SOURCE:
    # div.para-sections
    # --------------------------------------------------------

    containers = soup.select(
        "div.para-sections"
    )

    if containers:

        # If multiple para-sections exist, preserve their
        # original order and combine them.
        parts = []

        for container in containers:

            text = clean_legal_content(
                container
            )

            if text:
                parts.append(text)

        if parts:
            return "\n\n".join(parts)

    # --------------------------------------------------------
    # Secondary selector in case the site uses a slightly
    # different class structure.
    # --------------------------------------------------------

    containers = soup.select(
        ".para-sections"
    )

    if containers:

        parts = []

        for container in containers:

            text = clean_legal_content(
                container
            )

            if text:
                parts.append(text)

        if parts:
            return "\n\n".join(parts)

    # --------------------------------------------------------
    # IMPORTANT:
    # Do NOT fall back to the entire webpage.
    #
    # Otherwise menus, navigation, CSS-generated content,
    # etc. could enter the legal dataset.
    # --------------------------------------------------------

    return ""


# ============================================================
# TITLE
# ============================================================

def extract_title(soup):

    # Try page heading first.
    for tag_name in ["h1", "h2", "h3"]:

        tag = soup.find(tag_name)

        if tag:

            title = tag.get_text(
                " ",
                strip=True
            )

            if title:
                return title

    # Otherwise use <title>.
    if soup.title:

        return soup.title.get_text(
            " ",
            strip=True
        )

    return ""


# ============================================================
# FETCH ONE CASE
# ============================================================

def fetch_case(case_id):

    url = BASE_URL.format(case_id)

    retry = 0

    while True:

        # ----------------------------------------------------
        # Wait if DNS/network is down.
        # ----------------------------------------------------

        if not network_available():

            print(
                "  Network/DNS unavailable."
            )

            print(
                f"  Waiting {NETWORK_WAIT}s..."
            )

            time.sleep(
                NETWORK_WAIT
            )

            continue

        try:

            response = session.get(
                url,
                timeout=REQUEST_TIMEOUT
            )

            # ------------------------------------------------
            # Temporary HTTP errors.
            # ------------------------------------------------

            if response.status_code in [
                408,
                429,
                500,
                502,
                503,
                504,
            ]:

                retry += 1

                if retry <= MAX_RETRIES:

                    wait = retry * 10

                    print(
                        f"  HTTP {response.status_code}; "
                        f"retry {retry}/{MAX_RETRIES} "
                        f"in {wait}s"
                    )

                    time.sleep(wait)

                    continue

                print(
                    f"  HTTP {response.status_code}"
                )

                return None, "http_error"

            # ------------------------------------------------
            # Other HTTP errors.
            # ------------------------------------------------

            if response.status_code != 200:

                print(
                    f"  HTTP {response.status_code}"
                )

                return None, "http_error"

            # ------------------------------------------------
            # Parse.
            # ------------------------------------------------

            response.encoding = (
                response.apparent_encoding
                or "utf-8"
            )

            soup = BeautifulSoup(
                response.text,
                "html.parser"
            )

            content = extract_legal_content(
                soup
            )

            # ------------------------------------------------
            # No legal container.
            # ------------------------------------------------

            if not content:

                return None, "no_legal_content"

            title = extract_title(
                soup
            )

            record = {
                "id": str(case_id),
                "url": url,
                "title": title,
                "content": content,
                "scraped_at": datetime.now().isoformat(
                    timespec="seconds"
                ),
            }

            return record, "success"

        except (
            requests.exceptions.Timeout,
            requests.exceptions.ConnectionError,
            requests.exceptions.ChunkedEncodingError,
        ) as e:

            retry += 1

            print(
                f"  Network error: "
                f"{type(e).__name__}"
            )

            if retry <= MAX_RETRIES:

                wait = retry * 10

                print(
                    f"  Retry {retry}/{MAX_RETRIES} "
                    f"in {wait}s"
                )

                time.sleep(wait)

            else:

                # Do not permanently lose the ID because
                # network disappeared.
                print(
                    "  Network still unavailable."
                )

                print(
                    f"  Waiting {NETWORK_WAIT}s "
                    "before trying again..."
                )

                retry = 0

                time.sleep(
                    NETWORK_WAIT
                )

        except Exception as e:

            print(
                f"  Unexpected error: {e}"
            )

            return None, "unexpected_error"


# ============================================================
# BATCH FILE
# ============================================================

def get_batch_number():

    existing = []

    for filename in os.listdir(
        OUTPUT_DIR
    ):

        match = re.match(
            r"batch_(\d+)\.csv$",
            filename
        )

        if match:

            existing.append(
                int(match.group(1))
            )

    if not existing:
        return 1

    return max(existing) + 1


# ============================================================
# SAVE BATCH
# ============================================================

def save_batch(records, batch_number):

    if not records:
        return

    filename = os.path.join(
        OUTPUT_DIR,
        f"batch_{batch_number:04d}.csv"
    )

    temp_filename = filename + ".tmp"

    fields = [
        "id",
        "url",
        "title",
        "content",
        "scraped_at",
    ]

    with open(
        temp_filename,
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=fields,
            quoting=csv.QUOTE_MINIMAL
        )

        writer.writeheader()

        for record in records:

            writer.writerow({
                "id": record["id"],
                "url": record["url"],
                "title": record["title"],
                "content": record["content"],
                "scraped_at": record["scraped_at"],
            })

    # Atomic rename.
    os.replace(
        temp_filename,
        filename
    )

    print()
    print("=" * 70)
    print(
        f"✓ SAVED BATCH {batch_number:04d}"
    )
    print(
        f"  Records: {len(records)}"
    )
    print(
        f"  File: {filename}"
    )
    print("=" * 70)
    print()


# ============================================================
# CHECKPOINT
# ============================================================

def save_checkpoint(last_id):

    temp_file = STATE_FILE + ".tmp"

    with open(
        temp_file,
        "w",
        encoding="utf-8"
    ) as f:

        f.write(
            str(last_id)
        )

    os.replace(
        temp_file,
        STATE_FILE
    )


def load_checkpoint():

    if not os.path.exists(
        STATE_FILE
    ):
        return None

    try:

        with open(
            STATE_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            return int(
                f.read().strip()
            )

    except Exception:

        return None


# ============================================================
# FAILED IDS
# ============================================================

def save_failed(
    case_id,
    status
):

    file_exists = os.path.exists(
        FAILED_FILE
    )

    with open(
        FAILED_FILE,
        "a",
        encoding="utf-8",
        newline=""
    ) as f:

        writer = csv.writer(
            f
        )

        if not file_exists:

            writer.writerow([
                "id",
                "url",
                "status",
                "time",
            ])

        writer.writerow([
            case_id,
            BASE_URL.format(case_id),
            status,
            datetime.now().isoformat(
                timespec="seconds"
            ),
        ])


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("NKP LEGAL CONTENT → CSV")
    print("=" * 70)

    print(
        f"Range: {START_ID} → {END_ID}"
    )

    print(
        f"Batch size: {BATCH_SIZE}"
    )

    print(
        f"Output directory: {OUTPUT_DIR}"
    )

    print()
    print(
        "IMPORTANT:"
    )
    print(
        "Only div.para-sections legal content "
        "will be extracted."
    )
    print(
        "Legal wording will NOT be rewritten."
    )
    print()

    # --------------------------------------------------------
    # Existing checkpoint.
    # --------------------------------------------------------

    checkpoint = load_checkpoint()

    if checkpoint is not None:

        start_from = checkpoint + 1

        print(
            f"Checkpoint found: {checkpoint}"
        )

        print(
            f"Continuing from: {start_from}"
        )

    else:

        start_from = START_ID

        print(
            "No checkpoint found."
        )

        print(
            f"Starting from: {START_ID}"
        )

    # --------------------------------------------------------
    # Existing batch files.
    # --------------------------------------------------------

    batch_number = get_batch_number()

    print(
        f"Next batch number: {batch_number}"
    )

    print()

    records = []

    # --------------------------------------------------------
    # Crawl.
    # --------------------------------------------------------

    try:

        for case_id in range(
            start_from,
            END_ID + 1
        ):

            url = BASE_URL.format(
                case_id
            )

            print(
                f"[{case_id}/{END_ID}] {url}"
            )

            record, status = fetch_case(
                case_id
            )

            if status == "success":

                records.append(
                    record
                )

                print(
                    f"  ✓ Extracted "
                    f"{len(record['content'])} "
                    "characters"
                )

            else:

                print(
                    f"  - {status}"
                )

                save_failed(
                    case_id,
                    status
                )

            # ------------------------------------------------
            # Checkpoint after every ID.
            # ------------------------------------------------

            save_checkpoint(
                case_id
            )

            # ------------------------------------------------
            # Save exactly 100 records per CSV.
            # ------------------------------------------------

            if len(records) >= BATCH_SIZE:

                save_batch(
                    records,
                    batch_number
                )

                records = []

                batch_number += 1

            # ------------------------------------------------
            # Normal request delay.
            # ------------------------------------------------

            time.sleep(
                REQUEST_DELAY
            )

    except KeyboardInterrupt:

        print()
        print(
            "Interrupted by user."
        )

        # Save whatever is currently collected.
        if records:

            save_batch(
                records,
                batch_number
            )

        print(
            "Checkpoint has been preserved."
        )

        print(
            "Run the same command again to continue."
        )

        return

    # --------------------------------------------------------
    # Save final partial batch.
    # --------------------------------------------------------

    if records:

        save_batch(
            records,
            batch_number
        )

    print()
    print("=" * 70)
    print("DONE")
    print("=" * 70)

    print(
        f"CSV files: {OUTPUT_DIR}"
    )

    print(
        f"Checkpoint: {STATE_FILE}"
    )

    print(
        f"Failed IDs: {FAILED_FILE}"
    )


# ============================================================
# START
# ============================================================

if __name__ == "__main__":
    main()
