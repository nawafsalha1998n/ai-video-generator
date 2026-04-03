import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocalVideos } from "@/hooks/useLocalVideos";

export default function GenerateImage() {
  const [, setLocation] = useLocation();
  const { addVideo } = useLocalVideos();
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("10");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const [model, setModel] = useState("minimax/video-01");
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");

  const generateMutation = trpc.videos.generateFromImage.useMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setError("");
    if (!imageUrl) {
      setError("يرجى تحميل صورة");
      return;
    }
    if (!prompt.trim()) {
      setError("يرجى إدخال وصف الفيديو");
      return;
    }

    try {
      const video = await generateMutation.mutateAsync({
        imageUrl,
        prompt,
        duration: parseInt(duration),
        aspectRatio: aspectRatio as "16:9" | "1:1" | "9:16",
        resolution: resolution as "720p" | "480p",
        model: model as "minimax/video-01" | "bytedance/seedance-1-lite" | "kling-v2.5-turbo-pro",
      });

      // Add to local storage with server response data
      addVideo({
        requestId: video.requestId,
        type: "image-to-video",
        prompt,
        imageUrl,
        duration: parseInt(duration),
        aspectRatio: aspectRatio as "16:9" | "1:1" | "9:16",
        resolution: resolution as "720p" | "480p",
        status: video.status as any || "pending",
        videoUrl: video.videoUrl,
        errorMessage: video.errorMessage,
      });

      // Redirect to video details page
      setLocation(`/video/${video.requestId}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "حدث خطأ أثناء توليد الفيديو";
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="container max-w-2xl">
        <div className="mb-8">
          <Button variant="outline" onClick={() => setLocation("/")} className="mb-4">
            ← العودة
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">توليد فيديو من الصورة</h1>
          <p className="text-muted-foreground">
            حمّل صورة وأضف وصفاً لتحويلها إلى فيديو متحرك احترافي
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              إنشاء فيديو من صورة
            </CardTitle>
            <CardDescription>
              حمّل صورة وأدخل التفاصيل المطلوبة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="image">الصورة</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="معاينة الصورة"
                      className="mx-auto max-h-48 rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      تغيير الصورة
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById("image")?.click()}
                    className="cursor-pointer"
                  >
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      انقر لتحميل صورة أو اسحبها هنا
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG، GIF حتى 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">وصف الفيديو</Label>
              <Textarea
                id="prompt"
                placeholder="مثال: حركة بطيئة وهادئة، الكاميرا تقترب ببطء من المشهد..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">
                صف كيف تريد أن تتحرك الصورة والمشاعر المطلوبة
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">مدة الفيديو (ثانية)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} ثانية
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aspect-ratio">نسبة العرض</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger id="aspect-ratio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">عريض (16:9)</SelectItem>
                    <SelectItem value="1:1">مربع (1:1)</SelectItem>
                    <SelectItem value="9:16">عمودي (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">الدقة</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger id="resolution">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">نموذج التوليد</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimax/video-01">Hailuo (minimax) - الأفضل</SelectItem>
                    <SelectItem value="bytedance/seedance-1-lite">Seedance Lite - سريع</SelectItem>
                    <SelectItem value="kling-v2.5-turbo-pro">Kling Turbo Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !imageUrl || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  توليد الفيديو
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
