import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper, Alert } from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { lawFirmApi } from "../../api/lawfirm.api";
import { lawFirmWebsiteApi } from "../../api/lawFirmWebsite.api";

function buildTemplate(name: string, slug: string, isEducation: boolean) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, sans-serif; color: #0f172a; line-height: 1.6; }
  .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
  header { padding: 24px 0; border-bottom: 1px solid #e2e8f0; }
  .hero { padding: 80px 0; text-align: center; }
  h1 { font-size: 42px; font-weight: 800; margin-bottom: 16px; }
  .hero p { font-size: 18px; color: #475569; max-width: 560px; margin: 0 auto 32px; }
  .btn { display: inline-block; background: #1d4ed8; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  section { padding: 60px 0; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px; }
  .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
  footer { padding: 32px 0; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<header><div class="container"><strong>${name}</strong></div></header>
<section class="hero">
  <div class="container">
    <h1>${name}</h1>
    <p>${isEducation ? "Quality exam preparation, taught by experienced instructors." : "Trusted legal counsel for individuals and businesses."}</p>
    <a href="https://${slug}.${isEducation ? "student" : "portal"}.technocraftx.com" class="btn">${isEducation ? "Enroll Now" : "Client Portal"}</a>
  </div>
</section>
<section>
  <div class="container">
    <div class="grid">
      <div class="card"><strong>Edit This</strong><p>Replace this text with your own content.</p></div>
      <div class="card"><strong>Edit This</strong><p>Replace this text with your own content.</p></div>
      <div class="card"><strong>Edit This</strong><p>Replace this text with your own content.</p></div>
    </div>
  </div>
</section>
<footer><div class="container">&copy; 2026 ${name}. Powered by NyayaOne.</div></footer>
</body>
</html>`;
}

export function WebsiteEditorPage() {
  const { firmId } = useParams<{ firmId: string }>();
  const [html, setHtml] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: firm } = useQuery({
    queryKey: ["lawfirm", firmId],
    queryFn: () => lawFirmApi.getById(firmId as string),
    enabled: !!firmId,
  });

  useEffect(() => {
    if (firm) {
      setHtml((firm as any).websiteHtml || buildTemplate((firm as any).name, (firm as any).slug, (firm as any).tenantType === "EDUCATION"));
    }
  }, [firm]);

  const save = useMutation({
    mutationFn: () => lawFirmWebsiteApi.update(firmId as string, html),
    onSuccess: () => setSaved(true),
  });

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Website Editor — {(firm as any)?.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Edit the raw HTML below. This becomes the homepage at their subdomain. A starter template is pre-filled if
        they don't have a website yet.
      </Typography>

      {saved && <Alert severity="success" sx={{ mb: 2 }}>Website saved.</Alert>}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Paper elevation={0} sx={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 2, p: 2 }}>
          <TextField
            multiline
            fullWidth
            value={html}
            onChange={(e) => { setHtml(e.target.value); setSaved(false); }}
            sx={{ "& textarea": { fontFamily: "monospace", fontSize: 13 } }}
            minRows={24}
            maxRows={24}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving..." : "Save Website"}
            </Button>
          </Box>
        </Paper>
        <Paper elevation={0} sx={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden" }}>
          <iframe title="preview" srcDoc={html} style={{ width: "100%", height: 560, border: "none" }} />
        </Paper>
      </Box>
    </Box>
  );
}
