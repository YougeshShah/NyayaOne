import { useRef, useState, useCallback, useEffect } from "react";
import { Box, Button, Typography, Paper, Slider, TextField, IconButton, ButtonGroup, Chip, MenuItem, Tabs, Tab } from "@mui/material";
import UploadIcon from "@mui/icons-material/UploadOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import TitleIcon from "@mui/icons-material/TitleOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpenOutlined";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternateOutlined";

type ShapeKind = "rectangle" | "circle" | "line";

interface TextOverlay {
  id: string;
  kind: "text";
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

interface ShapeOverlay {
  id: string;
  kind: "shape";
  shapeType: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface ImageLayer {
  id: string;
  kind: "image";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

type Overlay = TextOverlay | ShapeOverlay;

const TEXT_COLORS = ["#000000", "#FFFFFF", "#EF4444", "#3B82F6", "#22C55E", "#F59E0B"];
const FILTERS = [
  { label: "None", value: "none" },
  { label: "Grayscale", value: "grayscale" },
  { label: "Sepia", value: "sepia" },
  { label: "Blur", value: "blur" },
];

export function PhotoEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layerInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const layerImagesRef = useRef<Record<string, HTMLImageElement>>({});

  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filterPreset, setFilterPreset] = useState("none");
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [imageLayers, setImageLayers] = useState<ImageLayer[]>([]);
  const [newText, setNewText] = useState("");
  const [newTextColor, setNewTextColor] = useState("#000000");
  const [hasImage, setHasImage] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [tab, setTab] = useState(0);
  const [newFontSize, setNewFontSize] = useState(32);
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameColor, setFrameColor] = useState("#000000");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; kind: "overlay" | "layer"; offsetX: number; offsetY: number } | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const cropStartRef = useRef<{ x: number; y: number } | null>(null);

  const cssFilter = () => {
    const base = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (filterPreset === "grayscale") return `${base} grayscale(100%)`;
    if (filterPreset === "sepia") return `${base} sepia(100%)`;
    if (filterPreset === "blur") return `${base} blur(2px)`;
    return base;
  };

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
    ctx.filter = cssFilter();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
    ctx.filter = "none";

    imageLayers.forEach((layer) => {
      const layerImg = layerImagesRef.current[layer.id];
      if (layerImg) ctx.drawImage(layerImg, layer.x, layer.y, layer.width, layer.height);
    });

    if (cropRect) {
      ctx.save();
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
      ctx.restore();
    }

    if (frameWidth > 0) {
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = frameWidth;
      ctx.strokeRect(frameWidth / 2, frameWidth / 2, canvas.width - frameWidth, canvas.height - frameWidth);
    }

    overlays.forEach((o) => {
      if (o.kind === "text") {
        ctx.font = `bold ${o.fontSize}px sans-serif`;
        ctx.fillStyle = o.color;
        ctx.textBaseline = "top";
        ctx.strokeStyle = o.color === "#FFFFFF" ? "#000000" : "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.strokeText(o.text, o.x, o.y);
        ctx.fillText(o.text, o.x, o.y);
      } else if (o.kind === "shape") {
        ctx.fillStyle = o.color;
        if (o.shapeType === "rectangle") {
          ctx.fillRect(o.x, o.y, o.width, o.height);
        } else if (o.shapeType === "circle") {
          ctx.beginPath();
          ctx.ellipse(o.x + o.width / 2, o.y + o.height / 2, o.width / 2, o.height / 2, 0, 0, 2 * Math.PI);
          ctx.fill();
        } else if (o.shapeType === "line") {
          ctx.strokeStyle = o.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(o.x, o.y);
          ctx.lineTo(o.x + o.width, o.y + o.height);
          ctx.stroke();
        }
      }
    });
  }, [rotation, brightness, contrast, saturation, filterPreset, overlays, imageLayers, frameWidth, frameColor, cropRect]);

  useEffect(() => {
    draw();
  }, [draw]);

  const resetAll = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setFilterPreset("none");
    setOverlays([]);
    setImageLayers([]);
    layerImagesRef.current = {};
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setHasImage(true);
      resetAll();
    };
    img.src = URL.createObjectURL(file);
  };

  const handleAddLayerImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const id = Date.now().toString();
        layerImagesRef.current[id] = img;
        const scale = Math.min(1, 200 / img.width);
        setImageLayers((prev) => [
          ...prev,
          { id, kind: "image", src: dataUrl, x: 20, y: 20, width: img.width * scale, height: img.height * scale },
        ]);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAddText = () => {
    if (!newText.trim()) return;
    setOverlays((prev) => [
      ...prev,
      { id: Date.now().toString(), kind: "text", text: newText, x: 40, y: 40 + prev.length * 44, fontSize: newFontSize, color: newTextColor },
    ]);
    setNewText("");
  };

  const handleAddShape = (shapeType: ShapeKind) => {
    setOverlays((prev) => [
      ...prev,
      { id: Date.now().toString(), kind: "shape", shapeType, x: 60, y: 60, width: 120, height: 80, color: newTextColor },
    ]);
  };

  const handleDeleteOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
  };

  const handleDeleteLayer = (id: string) => {
    setImageLayers((prev) => prev.filter((l) => l.id !== id));
    delete layerImagesRef.current[id];
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = downloadFormat === "png" ? "image/png" : downloadFormat === "jpeg" ? "image/jpeg" : "image/webp";
    const link = document.createElement("a");
    link.download = `edited-image.${downloadFormat}`;
    link.href = canvas.toDataURL(mime, 0.92);
    link.click();
  };

  const handleSaveProject = () => {
    if (!imageRef.current) return;
    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = imageRef.current.width;
    baseCanvas.height = imageRef.current.height;
    baseCanvas.getContext("2d")!.drawImage(imageRef.current, 0, 0);
    const project = {
      baseImage: baseCanvas.toDataURL("image/png"),
      rotation,
      brightness,
      contrast,
      saturation,
      filterPreset,
      overlays,
      imageLayers,
    };
    const blob = new Blob([JSON.stringify(project)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = "photo-project.json";
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleOpenProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const project = JSON.parse(reader.result as string);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setHasImage(true);
        setRotation(project.rotation ?? 0);
        setBrightness(project.brightness ?? 100);
        setContrast(project.contrast ?? 100);
        setSaturation(project.saturation ?? 100);
        setFilterPreset(project.filterPreset ?? "none");
        setOverlays(project.overlays ?? []);
        const layers: ImageLayer[] = project.imageLayers ?? [];
        let remaining = layers.length;
        if (remaining === 0) setImageLayers([]);
        layers.forEach((layer) => {
          const layerImg = new Image();
          layerImg.onload = () => {
            layerImagesRef.current[layer.id] = layerImg;
            remaining -= 1;
            if (remaining === 0) setImageLayers(layers);
          };
          layerImg.src = layer.src;
        });
      };
      img.src = project.baseImage;
    };
    reader.readAsText(file);
  };

  // Canvas is often displayed smaller than its real pixel size (CSS
  // max-width/max-height) -- convert a mouse event's screen position into
  // real canvas coordinates so dragging tracks the cursor accurately.
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const hitTestOverlay = (x: number, y: number) => {
    // Search from topmost (last drawn) down, so whatever is visually on
    // top is what gets picked when things overlap.
    for (let i = overlays.length - 1; i >= 0; i--) {
      const o = overlays[i];
      if (o.kind === "text") {
        const ctx = canvasRef.current!.getContext("2d")!;
        ctx.font = `bold ${o.fontSize}px sans-serif`;
        const width = ctx.measureText(o.text).width;
        if (x >= o.x && x <= o.x + width && y >= o.y && y <= o.y + o.fontSize) return o.id;
      } else {
        if (x >= o.x && x <= o.x + o.width && y >= o.y && y <= o.y + o.height) return o.id;
      }
    }
    return null;
  };

  const hitTestLayer = (x: number, y: number) => {
    for (let i = imageLayers.length - 1; i >= 0; i--) {
      const l = imageLayers[i];
      if (x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height) return l.id;
    }
    return null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPos(e);
    if (cropMode) {
      cropStartRef.current = { x, y };
      setCropRect({ x, y, w: 0, h: 0 });
      return;
    }
    const overlayId = hitTestOverlay(x, y);
    if (overlayId) {
      const o = overlays.find((o) => o.id === overlayId)!;
      dragRef.current = { id: overlayId, kind: "overlay", offsetX: x - o.x, offsetY: y - o.y };
      return;
    }
    const layerId = hitTestLayer(x, y);
    if (layerId) {
      const l = imageLayers.find((l) => l.id === layerId)!;
      dragRef.current = { id: layerId, kind: "layer", offsetX: x - l.x, offsetY: y - l.y };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cropMode && cropStartRef.current) {
      const { x, y } = getCanvasPos(e);
      const start = cropStartRef.current;
      setCropRect({ x: Math.min(start.x, x), y: Math.min(start.y, y), w: Math.abs(x - start.x), h: Math.abs(y - start.y) });
      return;
    }
    if (!dragRef.current) return;
    const { x, y } = getCanvasPos(e);
    const { id, kind, offsetX, offsetY } = dragRef.current;
    if (kind === "overlay") {
      setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, x: x - offsetX, y: y - offsetY } : o)));
    } else {
      setImageLayers((prev) => prev.map((l) => (l.id === id ? { ...l, x: x - offsetX, y: y - offsetY } : l)));
    }
  };

  const handleCanvasMouseUp = () => {
    dragRef.current = null;
    cropStartRef.current = null;
  };

  // Actually trims the base image down to the drawn selection -- creates
  // a brand new in-memory image from the cropped pixels and swaps it in,
  // so rotation/filters/overlays continue to work exactly as before on
  // the newly-cropped photo.
  const applyCrop = () => {
    if (!cropRect || !canvasRef.current || cropRect.w < 5 || cropRect.h < 5) return;
    const canvas = canvasRef.current;
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropRect.w;
    cropCanvas.height = cropRect.h;
    const cropCtx = cropCanvas.getContext("2d")!;
    cropCtx.drawImage(canvas, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h);

    const newImg = new Image();
    newImg.onload = () => {
      imageRef.current = newImg;
      setRotation(0);
      setCropRect(null);
      setCropMode(false);
    };
    newImg.src = cropCanvas.toDataURL("image/png");
  };

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Photo Editor
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Crop, rotate, filters, text, shapes, and merging multiple images — runs entirely in your browser, no
        upload cost. Save your work as a project file to keep editing later.
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <Button size="small" variant="outlined" startIcon={<FolderOpenIcon />} onClick={() => projectInputRef.current?.click()}>
          Open Project
        </Button>
        <input ref={projectInputRef} type="file" accept="application/json" hidden onChange={handleOpenProject} />
        {hasImage && (
          <Button size="small" variant="outlined" startIcon={<SaveIcon />} onClick={handleSaveProject}>
            Save Project
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
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
            <Button variant="contained" startIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()}>
              Upload Image
            </Button>
          ) : (
            <canvas
              ref={canvasRef}
              style={{ maxWidth: "100%", maxHeight: 500, borderRadius: 8, cursor: cropMode ? "crosshair" : (overlays.length || imageLayers.length ? "move" : "default") }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          )}
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
        </Paper>

        {hasImage && (
          <Paper elevation={0} sx={{ flex: "1 1 300px", border: "1px solid #E5E7EB", borderRadius: 3, p: 2.5 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
              <Tab label="Adjust" />
              <Tab label="Text & Shapes" />
              <Tab label="Layers" />
            </Tabs>

            {tab === 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Crop
                </Typography>
                {!cropMode ? (
                  <Button size="small" variant="outlined" fullWidth onClick={() => setCropMode(true)} sx={{ mb: 2 }}>
                    Start Crop
                  </Button>
                ) : (
                  <ButtonGroup fullWidth sx={{ mb: 2 }}>
                    <Button onClick={applyCrop} disabled={!cropRect || cropRect.w < 5}>
                      Apply Crop
                    </Button>
                    <Button onClick={() => { setCropMode(false); setCropRect(null); }}>Cancel</Button>
                  </ButtonGroup>
                )}

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Rotate
                </Typography>
                <ButtonGroup fullWidth sx={{ mb: 2 }}>
                  <Button startIcon={<RotateLeftIcon />} onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
                    Left
                  </Button>
                  <Button startIcon={<RotateRightIcon />} onClick={() => setRotation((r) => (r + 90) % 360)}>
                    Right
                  </Button>
                </ButtonGroup>

                <Typography variant="subtitle2" fontWeight={700}>Brightness</Typography>
                <Slider value={brightness} onChange={(_, v) => setBrightness(v as number)} min={30} max={170} sx={{ mb: 1.5 }} />
                <Typography variant="subtitle2" fontWeight={700}>Contrast</Typography>
                <Slider value={contrast} onChange={(_, v) => setContrast(v as number)} min={30} max={170} sx={{ mb: 1.5 }} />
                <Typography variant="subtitle2" fontWeight={700}>Saturation</Typography>
                <Slider value={saturation} onChange={(_, v) => setSaturation(v as number)} min={0} max={200} sx={{ mb: 2 }} />

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Filter</Typography>
                <TextField select size="small" fullWidth value={filterPreset} onChange={(e) => setFilterPreset(e.target.value)} sx={{ mb: 2 }}>
                  {FILTERS.map((f) => (
                    <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                  ))}
                </TextField>

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Frame / Border</Typography>
                <Typography variant="caption" color="text.secondary">Width: {frameWidth}px</Typography>
                <Slider value={frameWidth} onChange={(_, v) => setFrameWidth(v as number)} min={0} max={40} sx={{ mb: 1 }} />
                <Box sx={{ display: "flex", gap: 0.75, mb: 2 }}>
                  {TEXT_COLORS.map((c) => (
                    <Box
                      key={c}
                      onClick={() => setFrameColor(c)}
                      sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: c, cursor: "pointer", border: frameColor === c ? "2px solid #1d4ed8" : "1px solid #E5E7EB" }}
                    />
                  ))}
                </Box>
              </>
            )}

            {tab === 1 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Add Text</Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField size="small" fullWidth placeholder="Text..." value={newText} onChange={(e) => setNewText(e.target.value)} />
                  <IconButton color="primary" onClick={handleAddText}><TitleIcon /></IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">Text Size: {newFontSize}px</Typography>
                <Slider value={newFontSize} onChange={(_, v) => setNewFontSize(v as number)} min={12} max={96} sx={{ mb: 1 }} />
                <Box sx={{ display: "flex", gap: 0.75, mb: 2 }}>
                  {TEXT_COLORS.map((c) => (
                    <Box
                      key={c}
                      onClick={() => setNewTextColor(c)}
                      sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: c, cursor: "pointer", border: newTextColor === c ? "2px solid #1d4ed8" : "1px solid #E5E7EB" }}
                    />
                  ))}
                </Box>

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Add Shape</Typography>
                <ButtonGroup fullWidth sx={{ mb: 2 }}>
                  <Button onClick={() => handleAddShape("rectangle")}>Rectangle</Button>
                  <Button onClick={() => handleAddShape("circle")}>Circle</Button>
                  <Button onClick={() => handleAddShape("line")}>Line</Button>
                </ButtonGroup>

                {overlays.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Added items (click to remove)
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {overlays.map((o) => (
                        <Chip
                          key={o.id}
                          label={o.kind === "text" ? o.text : o.shapeType}
                          size="small"
                          onDelete={() => handleDeleteOverlay(o.id)}
                          deleteIcon={<DeleteIcon fontSize="small" />}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}

            {tab === 2 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Merge Another Image
                </Typography>
                <Button variant="outlined" fullWidth startIcon={<AddPhotoAlternateIcon />} onClick={() => layerInputRef.current?.click()} sx={{ mb: 2 }}>
                  Add Image Layer
                </Button>
                <input ref={layerInputRef} type="file" accept="image/*" hidden onChange={handleAddLayerImage} />

                {imageLayers.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
                    {imageLayers.map((l, i) => (
                      <Chip
                        key={l.id}
                        label={`Layer ${i + 1}`}
                        size="small"
                        variant={selectedLayerId === l.id ? "filled" : "outlined"}
                        color={selectedLayerId === l.id ? "primary" : "default"}
                        onClick={() => setSelectedLayerId(l.id)}
                        onDelete={() => handleDeleteLayer(l.id)}
                        deleteIcon={<DeleteIcon fontSize="small" />}
                      />
                    ))}
                  </Box>
                )}
                {selectedLayerId && imageLayers.find((l) => l.id === selectedLayerId) && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      Size: {Math.round(imageLayers.find((l) => l.id === selectedLayerId)!.width)}px
                    </Typography>
                    <Slider
                      value={imageLayers.find((l) => l.id === selectedLayerId)!.width}
                      onChange={(_, v) => {
                        const layer = imageLayers.find((l) => l.id === selectedLayerId)!;
                        const ratio = layer.height / layer.width;
                        const newWidth = v as number;
                        setImageLayers((prev) =>
                          prev.map((l) => (l.id === selectedLayerId ? { ...l, width: newWidth, height: newWidth * ratio } : l))
                        );
                      }}
                      min={30}
                      max={600}
                      sx={{ mb: 2 }}
                    />
                  </>
                )}
                <Typography variant="caption" color="text.secondary">
                  Click and drag any layer, text, or shape directly on the photo to reposition it.
                </Typography>
              </>
            )}

            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
              Download Format
            </Typography>
            <TextField select size="small" fullWidth value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value as any)} sx={{ mb: 2 }}>
              <MenuItem value="png">PNG (best quality, larger file)</MenuItem>
              <MenuItem value="jpeg">JPG (smaller file)</MenuItem>
              <MenuItem value="webp">WEBP (smallest, modern)</MenuItem>
            </TextField>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button fullWidth variant="outlined" startIcon={<RestartAltIcon />} onClick={resetAll}>
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
