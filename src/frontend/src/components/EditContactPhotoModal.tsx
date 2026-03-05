import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Check, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getInitials } from "../lib/app-utils";
import type { Contact } from "../types/contact";

interface EditContactPhotoModalProps {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onSave: (contactId: string, photoUrl: string) => void;
}

// Resize and compress image to avoid localStorage quota issues
function resizeImage(file: File, maxDim = 256, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function EditContactPhotoModal({
  contact,
  open,
  onClose,
  onSave,
}: EditContactPhotoModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes or contact changes
  useEffect(() => {
    if (!open) {
      setPreview(null);
      setIsProcessing(false);
      setImgError(false);
    }
  }, [open]);

  const contactPhotoUrl = contact?.photoUrl;
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on photoUrl change
  useEffect(() => {
    setImgError(false);
  }, [contactPhotoUrl]);

  if (!contact) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const resized = await resizeImage(file, 256, 0.8);
      setPreview(resized);
      setImgError(false);
    } catch {
      console.warn("Image processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!preview) return;
    onSave(contact.id, preview);
    setPreview(null);
    onClose();
  };

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  // Show preview if selected, otherwise show existing photo
  const displayPhoto =
    preview ?? (imgError ? null : (contact.photoUrl ?? null));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm w-full rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5 text-wa-green" />
            Update Profile Photo
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Photo preview */}
          <button
            type="button"
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-wa-green/20 to-wa-green-dark/20 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-wa-green/30 hover:border-wa-green transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={contact.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="font-display font-bold text-wa-green-dark text-xl">
                {getInitials(contact.name)}
              </span>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>

          <p className="text-sm text-muted-foreground text-center">
            Tap the photo to select a new image from your device
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Photo
          </Button>

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              <X className="w-4 h-4 mr-1.5" />
              Cancel
            </Button>
            <Button
              className="flex-1 bg-wa-green hover:bg-wa-green-dark text-white"
              onClick={handleSave}
              disabled={!preview || isProcessing}
            >
              <Check className="w-4 h-4 mr-1.5" />
              Save Photo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
