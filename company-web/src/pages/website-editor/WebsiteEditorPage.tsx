import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper, Alert, IconButton, Tabs, Tab, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CodeIcon from "@mui/icons-material/Code";
import { useQuery, useMutation } from "@tanstack/react-query";
import { lawFirmApi } from "../../api/lawfirm.api";
import { lawFirmWebsiteApi } from "../../api/lawFirmWebsite.api";

type SectionType = "hero" | "features" | "testimonial" | "cta" | "text";

interface Section {
  id: string;
  type: SectionType;
  // hero
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  // features (3 cards)
  cards?: { title: string; description: string }[];
  // testimonial
  quote?: string;
  author?: string;
  // text
  body?: string;
}

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero (Title + Button)",
  features: "Features Grid (3 Cards)",
  testimonial: "Testimonial Quote",
  cta: "Call to Action",
  text: "Plain Text Block",
};

function newSection(type: SectionType): Section {
  const id = Date.now().toString();
  if (type === "hero") return { id, type, title: "Your Firm Name", subtitle: "A short tagline about your services.", buttonText: "Contact Us", buttonLink: "#contact" };
  if (type === "features") return { id, type, cards: [{ title: "Service One", description: "Description here." }, { title: "Service Two", description: "Description here." }, { title: "Service Three", description: "Description here." }] };
  if (type === "testimonial") return { id, type, quote: "They handled our case with real professionalism.", author: "A Happy Client" };
  if (type === "cta") return { id, type, title: "Ready to get started?", buttonText: "Get in Touch", buttonLink: "#contact" };
  return { id, type, body: "Write anything here." };
}

function renderSectionHtml(s: Section): string {
  if (s.type === "hero") {
    return `<section style="padding:80px 24px;text-align:center;"><h1 style="font-size:42px;font-weight:800;margin-bottom:16px;">${s.title}</h1><p style="font-size:18px;color:#475569;max-width:560px;margin:0 auto 32px;">${s.subtitle}</p><a href="${s.buttonLink}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">${s.buttonText}</a></section>`;
  }
  if (s.type === "features") {
    const cards = (s.cards ?? []).map((c) => `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:24px;"><strong>${c.title}</strong><p style="color:#475569;margin-top:8px;">${c.description}</p></div>`).join("");
    return `<section style="padding:60px 24px;max-width:900px;margin:0 auto;"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">${cards}</div></section>`;
  }
  if (s.type === "testimonial") {
    return `<section style="padding:60px 24px;text-align:center;max-width:600px;margin:0 auto;"><p style="font-size:20px;font-style:italic;color:#334155;">"${s.quote}"</p><p style="margin-top:16px;font-weight:600;">— ${s.author}</p></section>`;
  }
  if (s.type === "cta") {
    return `<section style="padding:60px 24px;text-align:center;background:#0f172a;color:#fff;"><h2 style="font-size:28px;font-weight:800;margin-bottom:20px;">${s.title}</h2><a href="${s.buttonLink}" style="display:inline-block;background:#fff;color:#0f172a;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">${s.buttonText}</a></section>`;
  }
  return `<section style="padding:40px 24px;max-width:700px;margin:0 auto;"><p>${s.body}</p></section>`;
}

function buildFullHtml(name: string, sections: Section[]) {
  const body = sections.map(renderSectionHtml).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${name}</title>
<style>* { box-sizing: border-box; } body { font-family: -apple-system, sans-serif; color: #0f172a; margin: 0; line-height: 1.6; }</style>
</head>
<body>
<header style="padding:24px;border-bottom:1px solid #e2e8f0;"><strong>${name}</strong></header>
${body}
<footer style="padding:32px;text-align:center;color:#64748b;font-size:14px;border-top:1px solid #e2e8f0;">&copy; 2026 ${name}. Powered by TechnoOne.</footer>
</body>
</html>`;
}

export function WebsiteEditorPage() {
  const { firmId } = useParams<{ firmId: string }>();
  const [mode, setMode] = useState<"builder" | "raw">("builder");
  const [sections, setSections] = useState<Section[]>([]);
  const [rawHtml, setRawHtml] = useState("");
  const [addType, setAddType] = useState<SectionType>("hero");
  const [saved, setSaved] = useState(false);

  const { data: firm } = useQuery({
    queryKey: ["lawfirm", firmId],
    queryFn: () => lawFirmApi.getById(firmId as string),
    enabled: !!firmId,
  });

  useEffect(() => {
    if (firm && sections.length === 0 && !rawHtml) {
      const existing = (firm as any).websiteHtml;
      if (existing) {
        setRawHtml(existing);
        setMode("raw"); // existing raw HTML can't be reverse-parsed into sections -- edit it directly
      } else {
        setSections([newSection("hero"), newSection("features"), newSection("cta")]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firm]);

  const finalHtml = mode === "builder" ? buildFullHtml((firm as any)?.name ?? "", sections) : rawHtml;

  const save = useMutation({
    mutationFn: () => lawFirmWebsiteApi.update(firmId as string, finalHtml),
    onSuccess: () => setSaved(true),
  });

  const addSection = () => {
    setSections((prev) => [...prev, newSection(addType)]);
    setSaved(false);
  };
  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    setSaved(false);
  };
  const moveSection = (id: string, dir: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
    setSaved(false);
  };
  const updateSection = (id: string, patch: Partial<Section>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setSaved(false);
  };
  const updateCard = (sectionId: string, cardIndex: number, patch: Partial<{ title: string; description: string }>) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId || !s.cards) return s;
        const cards = [...s.cards];
        cards[cardIndex] = { ...cards[cardIndex], ...patch };
        return { ...s, cards };
      })
    );
    setSaved(false);
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Website Editor — {(firm as any)?.name}
        </Typography>
        <Button size="small" startIcon={<CodeIcon />} onClick={() => { setRawHtml(finalHtml); setMode(mode === "builder" ? "raw" : "builder"); }}>
          {mode === "builder" ? "Switch to Raw HTML" : "Switch to Section Builder"}
        </Button>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 2 }}>Website saved.</Alert>}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Paper elevation={0} sx={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 2, p: 2, maxHeight: 640, overflow: "auto" }}>
          {mode === "raw" ? (
            <TextField
              multiline
              fullWidth
              value={rawHtml}
              onChange={(e) => { setRawHtml(e.target.value); setSaved(false); }}
              minRows={26}
              sx={{ "& textarea": { fontFamily: "monospace", fontSize: 12 } }}
            />
          ) : (
            <>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField select size="small" value={addType} onChange={(e) => setAddType(e.target.value as SectionType)} sx={{ minWidth: 220 }}>
                  {Object.entries(SECTION_LABELS).map(([k, label]) => (
                    <MenuItem key={k} value={k}>{label}</MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={addSection}>
                  Add Section
                </Button>
              </Box>

              {sections.map((s, i) => (
                <Paper key={s.id} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      {SECTION_LABELS[s.type]}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => moveSection(s.id, -1)} disabled={i === 0}><ArrowUpwardIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => moveSection(s.id, 1)} disabled={i === sections.length - 1}><ArrowDownwardIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => removeSection(s.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>

                  {s.type === "hero" && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <TextField size="small" label="Title" value={s.title} onChange={(e) => updateSection(s.id, { title: e.target.value })} />
                      <TextField size="small" label="Subtitle" value={s.subtitle} onChange={(e) => updateSection(s.id, { subtitle: e.target.value })} />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField size="small" label="Button Text" value={s.buttonText} onChange={(e) => updateSection(s.id, { buttonText: e.target.value })} />
                        <TextField size="small" label="Button Link" value={s.buttonLink} onChange={(e) => updateSection(s.id, { buttonLink: e.target.value })} />
                      </Box>
                    </Box>
                  )}

                  {s.type === "features" && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {(s.cards ?? []).map((c, ci) => (
                        <Box key={ci} sx={{ display: "flex", gap: 1 }}>
                          <TextField size="small" label={`Card ${ci + 1} Title`} value={c.title} onChange={(e) => updateCard(s.id, ci, { title: e.target.value })} />
                          <TextField size="small" label="Description" fullWidth value={c.description} onChange={(e) => updateCard(s.id, ci, { description: e.target.value })} />
                        </Box>
                      ))}
                    </Box>
                  )}

                  {s.type === "testimonial" && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <TextField size="small" label="Quote" multiline value={s.quote} onChange={(e) => updateSection(s.id, { quote: e.target.value })} />
                      <TextField size="small" label="Author" value={s.author} onChange={(e) => updateSection(s.id, { author: e.target.value })} />
                    </Box>
                  )}

                  {s.type === "cta" && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <TextField size="small" label="Title" value={s.title} onChange={(e) => updateSection(s.id, { title: e.target.value })} />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField size="small" label="Button Text" value={s.buttonText} onChange={(e) => updateSection(s.id, { buttonText: e.target.value })} />
                        <TextField size="small" label="Button Link" value={s.buttonLink} onChange={(e) => updateSection(s.id, { buttonLink: e.target.value })} />
                      </Box>
                    </Box>
                  )}

                  {s.type === "text" && (
                    <TextField size="small" fullWidth multiline label="Text" value={s.body} onChange={(e) => updateSection(s.id, { body: e.target.value })} />
                  )}
                </Paper>
              ))}
            </>
          )}

          <Button variant="contained" fullWidth onClick={() => save.mutate()} disabled={save.isPending} sx={{ mt: 1 }}>
            {save.isPending ? "Saving..." : "Save Website"}
          </Button>
        </Paper>

        <Paper elevation={0} sx={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden" }}>
          <iframe title="preview" srcDoc={finalHtml} style={{ width: "100%", height: 640, border: "none" }} />
        </Paper>
      </Box>
    </Box>
  );
}
