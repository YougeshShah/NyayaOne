import { useRef, useState, useCallback, useEffect } from "react";
import { Box, Button, Typography, Paper, Slider, TextField, IconButton, ButtonGroup } from "@mui/material";
import UploadIcon from "@mui/icons-material/UploadOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import TitleIcon from "@mui/icons-material/TitleOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export function PhotoEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [newText, setNewText] = useState("");
  const [hasImage, setHasImage] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isSideways = rotation % 180 !== 0;
    canvas.width = isSideways ? img.height : img.width;
    canvas.height = isSideways ? img.width : img.height;

    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    ctx.filter = "none";
    textOverlays.forEach((t) => {
      ctx.font = `bold ${t.fontSize}px sans-serif`;
      ctx.fillStyle = t.color;
      ctx.textBaseline = "top";
      ctx.fillText(t.text, t.x, t.y);
    });
  }, [rotation, brightness, contrast, saturation, textOverlays]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setHasImage(true);
      setRotation(0);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setTextOverlays([]);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleAddText = () => {
    if (!newText.trim() || !canvasRef.current) return;
    setTextOverlays((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newText, x: 40, y: 40 + prev.length * 40, fontSize: 32, color: "#FFFFFF" },
    ]);
    setNewText("");
  };

  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setTextOverlays([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Box sx={{ maxWidth: 1000 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Photo Editor
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Quick crop, rotate, filters, and text overlays for marketing images, banners, and social posts — runs
        entirely in your browser, no upload cost.
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {/* Canvas area */}
        <Paper
          elevation={0}
          sx={{
            flex: "1 1 500px",
            border: "1px solid #E5E7EB",
            borderRadius: 3,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            bgcolor: "#F9FAFB",
            overflow: "auto",
          }}
        >
          {!hasImage ? (
            <Box sx={{ textAlign: "center" }}>
              <Button variant="contained" startIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()}>
                Upload Image
              </Button>
            </Box>
          ) : (
            <canvas ref={canvasRef} style={{ maxWidth: "100%", maxHeight: 500, borderRadius: 8 }} />
          )}
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
        </Paper>

        {/* Controls */}
        {hasImage && (
          <Paper elevation={0} sx={{ flex: "1 1 260px", border: "1px solid #E5E7EB", borderRadius: 3, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              Rotate
            </Typography>
            <ButtonGroup fullWidth sx={{ mb: 3 }}>
              <Button startIcon={<RotateLeftIcon />} onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
                Left
              </Button>
              <Button startIcon={<RotateRightIcon />} onClick={() => setRotation((r) => (r + 90) % 360)}>
                Right
              </Button>
            </ButtonGroup>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              Brightness
            </Typography>
            <Slider value={brightness} onChange={(_, v) => setBrightness(v as number)} min={30} max={170} sx={{ mb: 2 }} />

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              Contrast
            </Typography>
            <Slider value={contrast} onChange={(_, v) => setContrast(v as number)} min={30} max={170} sx={{ mb: 2 }} />

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              Saturation
            </Typography>
            <Slider value={saturation} onChange={(_, v) => setSaturation(v as number)} min={0} max={200} sx={{ mb: 3 }} />

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Add Text
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              <TextField size="small" fullWidth placeholder="Text..." value={newText} onChange={(e) => setNewText(e.target.value)} />
              <IconButton color="primary" onClick={handleAddText}>
                <TitleIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button fullWidth variant="outlined" startIcon={<RestartAltIcon />} onClick={handleReset}>
                Reset
              </Button>
              <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
                Download
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
