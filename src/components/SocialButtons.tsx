// Shared "Continue with Google / Lovable" block used by the maker and team sign-in pages.

export type SocialProvider = "google" | "lovable";

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11.2 11.2 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

// Lovable's brand mark, inlined so it renders without an extra network request.
export function LovableIcon() {
  return (
    <svg viewBox="0 0 121 122" aria-hidden="true" className="h-[17px] w-[17px] shrink-0" fill="none">
      <defs>
        <clipPath id="ss-lovable-mask">
          <path
            clipRule="evenodd"
            d="M36.0687 0C55.9888 0 72.1373 16.1551 72.1373 36.0835V49.7975H84.141C104.061 49.7975 120.21 65.9526 120.21 85.8809C120.21 105.809 104.061 121.964 84.141 121.964H0V36.0835C0 16.1551 16.1485 0 36.0687 0Z"
          />
        </clipPath>
        <radialGradient
          id="ss-lovable-b0"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(141.41178 0 0 141.23118 52.7381 65.1011)"
        >
          <stop offset="0" stopColor="#4B73FF" />
          <stop offset="0.35" stopColor="#4B73FF" stopOpacity="0.96" />
          <stop offset="0.6" stopColor="#4B73FF" stopOpacity="0.35" />
          <stop offset="0.8" stopColor="#4B73FF" stopOpacity="0.05" />
          <stop offset="1" stopColor="#4B73FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="ss-lovable-b1"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(164.25488 0 0 141.23118 61.6734 20.547)"
        >
          <stop offset="0" stopColor="#FF66F4" />
          <stop offset="0.35" stopColor="#FF66F4" stopOpacity="0.96" />
          <stop offset="0.62" stopColor="#FF66F4" stopOpacity="0.3" />
          <stop offset="0.8" stopColor="#FF66F4" stopOpacity="0.05" />
          <stop offset="1" stopColor="#FF66F4" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="ss-lovable-b2"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(141.41178 0 0 131.34308 78.6659 5.26802)"
        >
          <stop offset="0" stopColor="#FF0105" stopOpacity="0.9998" />
          <stop offset="0.35" stopColor="#FF0105" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#FF0105" stopOpacity="0.3" />
          <stop offset="0.8" stopColor="#FF0105" stopOpacity="0.05" />
          <stop offset="1" stopColor="#FF0105" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="ss-lovable-b3"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(108.97628 0 0 108.86768 63.121 20.5275)"
        >
          <stop offset="0" stopColor="#FE7B02" stopOpacity="0.97" />
          <stop offset="0.35" stopColor="#FE7B02" stopOpacity="0.8" />
          <stop offset="0.6" stopColor="#FE7B02" stopOpacity="0.25" />
          <stop offset="0.8" stopColor="#FE7B02" stopOpacity="0.05" />
          <stop offset="1" stopColor="#FE7B02" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g clipPath="url(#ss-lovable-mask)">
        <rect x="0" y="0" width="121" height="122" fill="url(#ss-lovable-b0)" />
        <rect x="0" y="0" width="121" height="122" fill="url(#ss-lovable-b1)" />
        <rect x="0" y="0" width="121" height="122" fill="url(#ss-lovable-b2)" />
        <rect x="0" y="0" width="121" height="122" fill="url(#ss-lovable-b3)" />
      </g>
    </svg>
  );
}

export function SocialButtons({ onPick }: { onPick: (provider: SocialProvider) => void }) {
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" className="btn-ghost w-full justify-center" onClick={() => onPick("google")}>
          <GoogleIcon />
          Continue with Google
        </button>
        <button type="button" className="btn-ghost w-full justify-center" onClick={() => onPick("lovable")}>
          <LovableIcon />
          Continue with Lovable
        </button>
      </div>
    </>
  );
}
