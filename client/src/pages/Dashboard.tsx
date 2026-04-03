import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Eye, Plus, Trash2, Video } from "lucide-react";
import { useLocation } from "wouter";
import { useLocalVideos } from "@/hooks/useLocalVideos";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { videos, deleteVideo, isLoading } = useLocalVideos();

  const handleDelete = (id: string) => {
    if (confirm("هل تريد حذف هذا الفيديو؟")) {
      deleteVideo(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-800 dark:text-blue-200",
        label: "جاري التوليد",
      },
      processing: {
        bg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-800 dark:text-purple-200",
        label: "جاري المعالجة",
      },
      done: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-800 dark:text-green-200",
        label: "مكتمل",
      },
      failed: {
        bg: "bg-red-100 dark:bg-red-900",
        text: "text-red-800 dark:text-red-200",
        label: "فشل",
      },
      expired: {
        bg: "bg-orange-100 dark:bg-orange-900",
        text: "text-orange-800 dark:text-orange-200",
        label: "انتهت الصلاحية",
      },
    };

    const badge = statusMap[status] || statusMap.pending;
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">سجلي</h1>
            <p className="text-muted-foreground">الفيديوهات المُنشأة (يتم حفظها في المتصفح)</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setLocation("/generate-text")} className="gap-2">
              <Plus className="h-4 w-4" />
              من النص
            </Button>
            <Button onClick={() => setLocation("/generate-image")} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              من الصورة
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">جاري التحميل...</p>
            </CardContent>
          </Card>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">لم تنشئ أي فيديوهات بعد</p>
              <Button onClick={() => setLocation("/generate-text")}>
                أنشئ فيديوك الأول
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">
                        {video.prompt}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(video.createdAt).toLocaleDateString("ar-SA")}
                      </CardDescription>
                    </div>
                    {getStatusBadge(video.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">النوع:</span>
                      <span className="font-medium">
                        {video.type === "text-to-video" ? "من النص" : "من الصورة"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المدة:</span>
                      <span className="font-medium">{video.duration} ثانية</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الدقة:</span>
                      <span className="font-medium">{video.resolution}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/video/${video.requestId}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      عرض
                    </Button>
                    {video.status === "done" && video.videoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = video.videoUrl!;
                          a.download = `video-${video.requestId}.mp4`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(video.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
