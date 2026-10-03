"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  email?: string;
  phone?: string;
  address?: string;
  socials?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  className?: string;
}

// Social SVG icons
const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12c-6.627 0-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838c-3.403 0-3.802.018-4.85.078-3.155.144-4.722 1.656-4.852 4.835-.06 1.045-.078 1.447-.078 4.85 0 3.403.018 3.802.078 4.85.13 3.179 1.697 4.697 4.697 4.852 1.06.058 1.447.078 4.85.078 3.403 0 3.802-.018 4.85-.078 3.155-.144 4.722-1.673 4.852-4.852.06-1.045.078-1.447.078-4.85 0-3.403-.018-3.802-.078-4.85-.144-3.155-1.697-4.722-4.697-4.852-1.06-.058-1.447-.078-4.85-.078zm0 2.916c2.738 0 3.038.016 4.22.078 2.475.12 3.666 1.331 3.775 3.775.062 1.17.078 1.46.078 4.22 0 2.76-.016 3.038-.078 4.22-.109 2.444-1.3 3.666-3.775 3.775-1.182.062-1.482.078-4.22.078-2.76 0-3.038-.016-4.22-.078-2.475-.12-3.666-1.331-3.775-3.775-.062-1.17-.078-1.46-.078-4.22 0-2.76.016-3.038.078-4.22.109-2.444 1.3-3.666 3.775-3.775 1.182-.062 1.482-.078 4.22-.078zm0-3.804c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .773 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .773 23.2 0 22.222 0h.003z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export function TopBar({
  email = "support@example.com",
  phone = "+1 (555) 123-4567",
  address = "123 Main St, City, State 12345",
  socials = {},
  className,
}: TopBarProps) {
  return (
   <div className="w-full ">
     <div className={cn(" w-full bg-secondary text-secondary-foreground py-2 shadow-sm ", className)}>
      <div className="px-4 md:px-8 lg:px-12  mx-auto flex items-center justify-between">
        {/* Left - Contact Info */}
        <div className="flex items-center gap-4 text-xs">
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">{email}</span>
          </a>
          <a
            href={`tel:${phone.replace(/\D/g, '')}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">{phone}</span>
          </a>
        </div>

        {/* Right - Social Icons + Address */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 hidden md:flex text-xs">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">{address}</span>
          </div>
          {socials.facebook && (
            <a
              href={socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
          )}
          {socials.twitter && (
            <a
              href={socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Twitter"
            >
              <TwitterIcon />
            </a>
          )}
          {socials.instagram && (
            <a
              href={socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
          )}
          {socials.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="LinkedIn"
            >
              <LinkedinIcon />
            </a>
          )}
          {socials.youtube && (
            <a
              href={socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="YouTube"
            >
              <YoutubeIcon />
            </a>
          )}
        </div>
      </div>
    </div>
   </div>
  );
}
