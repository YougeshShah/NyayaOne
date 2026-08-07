# Database Backup — Setup (Do This Once, On the Live Server)

## 1. Make the script executable
```bash
chmod +x ~/nyayaone/backend/scripts/backup-database.sh
```

## 2. Test it once manually
```bash
~/nyayaone/backend/scripts/backup-database.sh
ls -la ~/nyayaone-backups/
```
You should see a `.sql.gz` file appear.

## 3. Schedule it to run automatically every night
```bash
crontab -e
```
Add this line (runs daily at 2:00 AM server time):
```
0 2 * * * /home/YOUR_USERNAME/nyayaone/backend/scripts/backup-database.sh >> /home/YOUR_USERNAME/nyayaone-backups/backup.log 2>&1
```
(Replace `YOUR_USERNAME` with your actual server username, and adjust the path if your repo lives elsewhere.)

Save and exit — cron picks it up automatically, no restart needed.

## 4. Restoring from a backup (if you ever need to)
```bash
gunzip -c ~/nyayaone-backups/nyayaone-backup-2026-08-07.sql.gz | docker exec -i nyayaone_postgres_prod psql -U nyayaone nyayaone_db
```

## Later — Off-Server Copy (Recommended, Do When Ready)
Local backups protect against "someone ran a bad command and deleted data."
They do NOT protect against the server itself failing. When ready, install
`rclone` and add one line to the script (see the comment inside
`backup-database.sh`) to also copy backups to Backblaze B2 / Cloudflare R2
— both have free tiers large enough for this for a long time.
