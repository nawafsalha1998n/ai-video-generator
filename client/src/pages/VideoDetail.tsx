import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Download, Loader2, Trash2, Video } from "lucide-react";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useLocalVideos } from "@/hooks/useLocalVideos";

export default function VideoDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/video/:requestId");
  const { updateVideo, deleteVideo, getVideo } = useLocalVideos();

  const requestId = params?.requestId as string;
  const video = getVideo(requestId);

  const { data: queryData } = trpc.videos.checkStatus.useQuery(
    { requestId },
    {
      enabled: !!requestId && (video?.status === "pending" || video?.status === "processing"),
      refetchInterval: 3000,
    }
  );

  // Update local video when query data changes
  useEffect(() => {
    if (queryData) {
      updateVideo(requestId, {
        status: queryData.status as any,
        videoUrl: queryData.videoUrl ? queryData.videoUrl : undefined,
        errorMessage: queryData.errorMessage ? queryData.errorMessage : undefined,
        completedAt: queryData.status === "done" ? Date.now() : undefined,
      });
    }
  }, [queryData, requestId, updateVideo]);

  if (!match) {
    return (
      <div className="container py-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            معرّف الفيديو غير صحيح
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
        <div className="container">
          <Button variant="outline" onClick={() => setLocation("/dashboard")} className="mb-4">
            ← العودة
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لم يتم العثور على الفيديو
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("هل تريد حذف هذا الفيديو؟")) {
      deleteVideo(video.id);
      setLocation("/dashboard");
    }
  };

  const handleDownload = () => {
    if (!video.videoUrl) return;
    const a = document.createElement("a");
    a.href = video.videoUrl;
    a.download = `video-${video.requestId}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getStatusText = () => {
    switch (video.status) {
      case "pending":
        return "جاري التوليد...";
      case "processing":
        return "جاري المعالجة...";
      case "done":
        return "مكتمل";
      case "failed":
        return "فشل التوليد";
      case "expired":
        return "انتهت صلاحية الطلب";
      default:
        return "جاري المعالجة";
    }
  };

  const getStatusColor = () => {
    switch (video.status) {
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            ← العودة
          </Button>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  حالة الفيديو
                </CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(video.status === "pending" || video.status === "processing") && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    يتم معالجة الفيديو الآن. قد يستغرق عدة دقائق...
                  </p>
                  <Progress value={50} className="h-2" />
                </div>
              )}

              {video.status === "done" && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ تم إنشاء الفيديو بنجاح!
                </p>
              )}

              {video.status === "failed" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {video.errorMessage || "فشل توليد الفيديو"}
                  </AlertDescription>
                </Alert>
              )}

              {video.status === "expired" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    انتهت صلاحية الطلب. يرجى المحاولة مرة أخرى.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Video Preview */}
          {video.status === "done" && video.videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>معاينة الفيديو</CardTitle>
              </CardHeader>
              <CardContent>
                <video
                  src={video.videoUrl}
                  controls
                  className="w-full rounded-lg bg-black"
                />
              </CardContent>
            </Card>
          )}

          {/* Video Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الفيديو</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">النوع</p>
                  <p className="text-foreground">
                    {video.type === "text-to-video" ? "من النص" : "من الصورة"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">المدة</p>
                  <p className="text-foreground">{video.duration} ثانية</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">نسبة العرض</p>
                  <p className="text-foreground">{video.aspectRatio}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الدقة</p>
                  <p className="text-foreground">{video.resolution}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">الوصف</p>
                <p className="text-foreground text-sm bg-muted p-3 rounded-lg">
                  {video.prompt}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">تاريخ الإنشاء</p>
                <p className="text-foreground text-sm">
                  {new Date(video.createdAt).toLocaleString("ar-SA")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            {video.status === "done" && video.videoUrl && (
              <Button onClick={handleDownload} className="flex-1" size="lg">
                <Download className="mr-2 h-4 w-4" />
                تحميل الفيديو
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              size="lg"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              حذف الفيديو
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
