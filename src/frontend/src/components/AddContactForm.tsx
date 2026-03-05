import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, User, UserPlus, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { cn } from "../lib/utils";

interface AddContactFormProps {
  onAdd: (name: string, phone: string, photoUrl?: string) => void;
  onClose?: () => void;
  inline?: boolean;
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

export function AddContactForm({
  onAdd,
  onClose,
  inline = false,
}: AddContactFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const errs: { name?: string; phone?: string } = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[\d\s+\-()]{6,20}$/.test(phone.trim())) {
      errs.phone = "Enter a valid phone number";
    }
    return errs;
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const resized = await resizeImage(file, 256, 0.8);
      setPhotoUrl(resized);
    } catch {
      console.warn("Image processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onAdd(name.trim(), phone.trim(), photoUrl);
    setName("");
    setPhone("");
    setPhotoUrl(undefined);
    setErrors({});
    setSubmitted(false);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", inline && "p-4")}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-wa-green/10 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-wa-green" />
          </div>
          <h3 className="font-display font-semibold text-foreground">
            Add New Contact
          </h3>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Photo upload */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          className="relative w-16 h-16 rounded-full bg-muted border-2 border-dashed border-wa-green/40 flex items-center justify-center cursor-pointer hover:border-wa-green transition-colors overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPhotoUrl(undefined)}
            />
          ) : (
            <User className="w-7 h-7 text-muted-foreground" />
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-wa-green rounded-full flex items-center justify-center">
            <Camera className="w-3 h-3 text-white" />
          </div>
        </button>
        <p className="text-xs text-muted-foreground">
          Tap to add profile photo (optional)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        {photoUrl && (
          <button
            type="button"
            onClick={() => setPhotoUrl(undefined)}
            className="text-xs text-destructive hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Remove photo
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-name" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          id="contact-name"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(
            "h-10 transition-all",
            submitted &&
              errors.name &&
              "border-destructive focus-visible:ring-destructive",
          )}
        />
        {submitted && errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-phone" className="text-sm font-medium">
          Phone Number
        </Label>
        <Input
          id="contact-phone"
          placeholder="e.g. +1 234 567 8900"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={cn(
            "h-10 transition-all",
            submitted &&
              errors.phone &&
              "border-destructive focus-visible:ring-destructive",
          )}
        />
        {submitted && errors.phone && (
          <p className="text-xs text-destructive">{errors.phone}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-wa-green hover:bg-wa-green-dark text-white font-semibold h-10 rounded-lg shadow-wa transition-all"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Add Contact
      </Button>
    </form>
  );
}
