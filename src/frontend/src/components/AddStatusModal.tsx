import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Image, Type, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { Contact } from "../types/contact";

interface AddStatusModalProps {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onAdd: (
    contactId: string,
    type: "photo" | "text",
    content: string,
    caption?: string,
  ) => void;
}

export function AddStatusModal({
  contact,
  open,
  onClose,
  onAdd,
}: AddStatusModalProps) {
  const [activeTab, setActiveTab] = useState<"photo" | "text">("photo");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setPhotoPreview(null);
    setCaption("");
    setStatusText("");
    setActiveTab("photo");
    onClose();
  }, [onClose]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") {
          setPhotoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!contact) return;
    if (activeTab === "photo" && photoPreview) {
      onAdd(contact.id, "photo", photoPreview, caption.trim() || undefined);
    } else if (activeTab === "text" && statusText.trim()) {
      onAdd(contact.id, "text", statusText.trim());
    }
    handleClose();
  }, [
    contact,
    activeTab,
    photoPreview,
    caption,
    statusText,
    onAdd,
    handleClose,
  ]);

  const isSubmitDisabled =
    activeTab === "photo" ? !photoPreview : !statusText.trim();

  const initials = contact?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-md rounded-2xl"
        data-ocid="add_status.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-lg flex items-center gap-2">
            {/* Contact avatar */}
            <span className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-wa-green flex items-center justify-center text-white text-xs font-bold">
              {contact?.photoUrl ? (
                <img
                  src={contact.photoUrl}
                  alt={contact.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </span>
            Add Status — {contact?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "photo" | "text")}
          className="mt-2"
        >
          <TabsList className="w-full grid grid-cols-2 rounded-xl">
            <TabsTrigger
              value="photo"
              className="rounded-lg gap-1.5"
              data-ocid="add_status.photo_tab"
            >
              <Image className="w-3.5 h-3.5" />
              Photo
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className="rounded-lg gap-1.5"
              data-ocid="add_status.text_tab"
            >
              <Type className="w-3.5 h-3.5" />
              Text
            </TabsTrigger>
          </TabsList>

          {/* Photo tab */}
          <TabsContent value="photo" className="mt-4 space-y-3">
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-wa-green hover:bg-wa-green/5 transition-all"
                data-ocid="add_status.dropzone"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Click to upload photo
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, WEBP
                </p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="add_status.upload_button"
            />
            <div className="space-y-1.5">
              <Label
                htmlFor="status-caption"
                className="text-xs text-muted-foreground"
              >
                Caption (optional)
              </Label>
              <input
                id="status-caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                maxLength={200}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </TabsContent>

          {/* Text tab */}
          <TabsContent value="text" className="mt-4 space-y-2">
            <div className="relative">
              <Textarea
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="Type your status..."
                maxLength={500}
                className="min-h-[140px] resize-none rounded-xl text-sm leading-relaxed pr-14"
                data-ocid="add_status.textarea"
              />
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                {statusText.length}/500
              </span>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-2 gap-2 flex-row">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex-1 rounded-xl"
            data-ocid="add_status.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="flex-1 rounded-xl bg-wa-green hover:bg-wa-green-dark text-white font-semibold"
            data-ocid="add_status.submit_button"
          >
            Add Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
