//Icons.tsx
// Agrega estos iconos si no los tienes
export const VolumeIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

export const MicrophoneIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

export const MutedMicrophoneIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
  </svg>
);

export const MutedLocallyMicrophoneIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 ${className}`}
  >
    {/* Micrófono */}
    <path
      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
      fill="currentColor"
    />
    <path
      d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
      fill="currentColor"
    />

    {/* Cruz de mute local en rojo, más grande */}
    <path
      d="M15 16.59L16.41 15 19 17.59 21.59 15 23 16.41 20.41 19 
         23 21.59 21.59 23 19 20.41 16.41 23 15 21.59 17.59 19z"
      fill="red"
      transform="scale(1.2) translate(-5 -7)"
    />
  </svg>
);

export const HeadphonesIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.98423 12.9162C2.97585 12.8329 2.96625 12.7272 2.95688 12.6018C2.93272 12.2782 2.90995 11.8208 2.9141 11.2737C2.92233 10.1862 3.03699 8.71096 3.47849 7.21665C3.92001 5.72226 4.70463 4.15592 6.08896 2.96159C7.48926 1.75349 9.41802 1 12 1C14.582 1 16.5107 1.75349 17.911 2.96159C19.2954 4.15592 20.08 5.72226 20.5215 7.21665C20.963 8.71096 21.0777 10.1862 21.0859 11.2737C21.0901 11.8208 21.0673 12.2782 21.0431 12.6018C21.0338 12.7272 21.0242 12.8329 21.0158 12.9162L21.0208 12.9189C22.0321 13.466 23 14.435 23 16V19C23 20.565 22.0321 21.534 21.0208 22.0811C20.0373 22.6131 18.8886 22.8291 18.1158 22.9223C16.9041 23.0682 16 22.0814 16 21V14C16 12.9186 16.9041 11.9318 18.1158 12.0777C18.3918 12.111 18.7158 12.1599 19.0631 12.2334C19.0777 11.9785 19.0888 11.6575 19.086 11.2888C19.0786 10.3138 18.9745 9.03904 18.6035 7.78334C18.2325 6.52774 17.6109 5.34408 16.6046 4.47591C15.6143 3.62151 14.168 3 12 3C9.83199 3 8.38575 3.62151 7.39543 4.47591C6.38913 5.34408 5.7675 6.52774 5.39652 7.78334C5.02552 9.03904 4.92143 10.3138 4.91404 11.2888C4.91125 11.6575 4.92229 11.9785 4.93689 12.2334C5.28418 12.1599 5.60817 12.111 5.88422 12.0777C7.09594 11.9318 8 12.9186 8 14V21C8 22.0814 7.09594 23.0682 5.88422 22.9223C5.11136 22.8291 3.96273 22.6131 2.97917 22.0811C1.96791 21.534 1 20.565 1 19V16C1 14.435 1.96791 13.466 2.97917 12.9189L2.98423 12.9162ZM18 20.9209C18.6625 20.8323 19.4542 20.6546 20.0692 20.3219C20.6953 19.9833 21 19.5754 21 19V16C21 15.4246 20.6953 15.0167 20.0692 14.6781C19.4542 14.3454 18.6625 14.1677 18 14.0791V20.9209ZM6 14.0791C5.33746 14.1677 4.54579 14.3454 3.93076 14.6781C3.30474 15.0167 3 15.4246 3 16L3 19C3 19.5754 3.30474 19.9833 3.93076 20.3219C4.54579 20.6546 5.33746 20.8323 6 20.9209V14.0791Z"
    />
  </svg>
);

export const DeafenedHeadphonesIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.95688 12.6018C2.96625 12.7272 2.97585 12.8329 2.98423 12.9162L2.97917 12.9189C1.96791 13.466 1 14.435 1 16V19C1 20.565 1.96791 21.534 2.97917 22.0811C3.96273 22.6131 5.11136 22.8291 5.88422 22.9223C7.09594 23.0682 8 22.0814 8 21V14C8 12.9186 7.09594 11.9318 5.88422 12.0777C5.60817 12.111 5.28418 12.1599 4.93689 12.2334C4.92229 11.9785 4.91125 11.6575 4.91404 11.2888C4.92056 10.4275 5.00257 9.33219 5.27738 8.22278L3.67314 6.61854C3.6018 6.81848 3.53712 7.0182 3.47849 7.21665C3.03699 8.71096 2.92233 10.1862 2.9141 11.2737C2.90995 11.8208 2.93272 12.2782 2.95688 12.6018ZM3.93076 14.6781C4.54579 14.3454 5.33746 14.1677 6 14.0791V20.9209C5.33746 20.8323 4.54579 20.6546 3.93076 20.3219C3.30474 19.9833 3 19.5754 3 19L3 16C3 15.4246 3.30474 15.0167 3.93076 14.6781Z"
    />
    <path d="M6.03107 3.01206L7.44916 4.43015C8.43787 3.59941 9.87088 3 12 3C14.168 3 15.6143 3.62151 16.6046 4.47591C17.6109 5.34408 18.2325 6.52774 18.6035 7.78334C18.9745 9.03904 19.0786 10.3138 19.086 11.2888C19.0888 11.6575 19.0777 11.9785 19.0631 12.2334C18.7158 12.1599 18.3918 12.111 18.1158 12.0777C17.2307 11.9711 16.5098 12.4689 16.1854 13.1664L18 14.981V14.0791C18.6625 14.1677 19.4542 14.3454 20.0692 14.6781C20.6953 15.0167 21 15.4246 21 16V17.981L22.8905 19.8715C22.961 19.6041 23 19.314 23 19V16C23 14.435 22.0321 13.466 21.0208 12.9189L21.0158 12.9162C21.0242 12.8329 21.0338 12.7272 21.0431 12.6018C21.0673 12.2782 21.0901 11.8208 21.0859 11.2737C21.0777 10.1862 20.963 8.71096 20.5215 7.21665C20.08 5.72226 19.2954 4.15592 17.911 2.96159C16.5107 1.75349 14.582 1 12 1C9.41802 1 7.48926 1.75349 6.08896 2.96159C6.06954 2.97834 6.05025 2.99517 6.03107 3.01206Z" />
    <path d="M19.6713 22.6167L16 18.9454V21C16 22.0814 16.9041 23.0682 18.1158 22.9223C18.5482 22.8702 19.0983 22.7796 19.6713 22.6167Z" />
    <path d="M2.00788 3.42207C1.61736 3.03154 1.61736 2.39838 2.00789 2.00785C2.39841 1.61733 3.03157 1.61733 3.4221 2.00785L22.0004 20.5862C22.391 20.9767 22.391 21.6099 22.0004 22.0004C21.6099 22.3909 20.9767 22.3909 20.5862 22.0004L2.00788 3.42207Z" />
  </svg>
);

export const SignalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M17.1929 20.542C17.4797 21.0139 18.0999 21.1704 18.5438 20.8418C19.7886 19.9206 20.8279 18.7446 21.5901 17.388C22.5159 15.74 23.0015 13.8813 23 11.9911C22.9985 10.1008 22.5099 8.24291 21.5813 6.59646C20.817 5.24112 19.7757 4.06675 18.5295 3.14756C18.0851 2.81973 17.4651 2.97722 17.179 3.44961C16.8929 3.92199 17.0462 4.53563 17.484 4.87241C18.4384 5.60674 19.2384 6.52748 19.8333 7.5823C20.5924 8.92836 20.9919 10.4473 20.9931 11.9927C20.9944 13.5381 20.5974 15.0577 19.8404 16.405C19.2472 17.4608 18.4487 18.3828 17.4955 19.1187C17.0583 19.4562 16.906 20.07 17.1929 20.542Z" />
      <path d="M15.1784 17.0884C15.471 17.5568 16.0939 17.7048 16.5159 17.3485C17.1624 16.8026 17.7068 16.1422 18.1201 15.3976C18.6959 14.3605 18.9987 13.1941 19 12.0078C19.0013 10.8216 18.7012 9.6545 18.1277 8.61609C17.716 7.87056 17.1732 7.20893 16.5279 6.66161C16.1067 6.30437 15.4834 6.45097 15.1898 6.91872C14.8961 7.38648 15.0461 7.99795 15.4461 8.37868C15.8144 8.7291 16.1285 9.13501 16.3761 9.58341C16.7856 10.325 16.9999 11.1585 16.999 12.0056C16.998 12.8527 16.7818 13.6857 16.3706 14.4264C16.122 14.8742 15.807 15.2794 15.438 15.629C15.0371 16.0088 14.8858 16.62 15.1784 17.0884Z" />
      <path d="M6.80715 3.45801C6.52025 2.98608 5.90008 2.82959 5.45615 3.15815C4.21145 4.07935 3.1721 5.25541 2.40993 6.61198C1.48406 8.25993 0.998473 10.1187 1 12.0089C1.00153 13.8991 1.49013 15.7571 2.41867 17.4035C3.18303 18.7589 4.22428 19.9332 5.47048 20.8524C5.91494 21.1802 6.53486 21.0228 6.82099 20.5504C7.10711 20.078 6.95376 19.4643 6.51604 19.1276C5.56163 18.3932 4.76161 17.4725 4.16673 16.4177C3.40759 15.0716 3.00814 13.5526 3.00689 12.0073C3.00564 10.4619 3.40263 8.94228 4.15958 7.59499C4.75275 6.53921 5.55128 5.61717 6.5045 4.8813C6.94168 4.54381 7.09404 3.92993 6.80715 3.45801Z" />
      <path d="M8.82162 6.91159C8.52904 6.44317 7.90607 6.29518 7.48409 6.65147C6.83758 7.19734 6.29322 7.85776 5.87985 8.60237C5.30409 9.63949 5.00133 10.8059 5.00001 11.9921C4.99868 13.1784 5.29882 14.3455 5.87226 15.3839C6.28396 16.1294 6.82683 16.791 7.47211 17.3384C7.8933 17.6956 8.51659 17.549 8.81023 17.0812C9.10386 16.6135 8.95393 16.002 8.55385 15.6213C8.18562 15.2709 7.87155 14.865 7.62393 14.4166C7.21442 13.675 7.00007 12.8415 7.00102 11.9944C7.00197 11.1473 7.21818 10.3143 7.62936 9.57361C7.87798 9.12576 8.19296 8.72056 8.56198 8.37096C8.96291 7.99113 9.11421 7.38 8.82162 6.91159Z" />
      <path d="M15 12C15 13.6568 13.6569 15 12 15C10.3431 15 9 13.6568 9 12C9 10.3431 10.3431 8.99998 12 8.99998C13.6569 8.99998 15 10.3431 15 12ZM10.9895 12C10.9895 12.5581 11.4419 13.0105 12 13.0105C12.5581 13.0105 13.0105 12.5581 13.0105 12C13.0105 11.4419 12.5581 10.9894 12 10.9894C11.4419 10.9894 10.9895 11.4419 10.9895 12Z" />
    </g>
  </svg>
);

export const VolumeUpIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
  </svg>
);

export const VolumeMuteIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
  </svg>
);

export const ShieldIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="SVGRepo_iconCarrier">
      <path
        d="M9.5 12.4L10.9286 14L14.5 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 14.4963 20.1632 16.4284 19 17.9041M3.19284 14C4.05026 18.2984 7.57641 20.5129 9.89856 21.5273C10.62 21.8424 10.9807 22 12 22C13.0193 22 13.38 21.8424 14.1014 21.5273C14.6796 21.2747 15.3324 20.9478 16 20.5328"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

export const CameraIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

export const InvitePeopleIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    className={`w-5 h-5 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

export const OptionsIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="6" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="12" cy="18" r="2" fill="currentColor" />
  </svg>
);

export const AssignRoleIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const KickIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const BanIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.93 4.93L19.07 19.07"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ManageRolesIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export const LogoutIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export const DotsHorizontalIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
  </svg>
);

export const DotsVerticalIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="6" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="18" r="2" />
  </svg>
);

export const BackArrowIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="31" y1="12" x2="3" y2="12" />
    <polyline points="10 19 3 12 10 5" />
  </svg>
);

export const ProjectIcon: React.FC = () => (
  <svg
    version="1.1"
    baseProfile="tiny"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    overflow="visible"
    xmlSpace="preserve"
    width="20"
    height="20"
  >
    <g>
      <rect y="0" fill="none" width="24" height="24"></rect>
      <polygon
        fillRule="evenodd"
        fill="currentColor"
        points="0.8,5.9 3.7,0.8 9.5,0.8 12.4,5.9 9.5,10.9 3.7,10.9 "
      ></polygon>
      <polygon
        fillRule="evenodd"
        fill="currentColor"
        points="11.4,7.7 8.5,2.6 9.5,0.7 12.4,5.9 "
      ></polygon>
      <polygon
        fillRule="evenodd"
        fill="currentColor"
        points="2.7,9.3 8.5,9.3 10.5,5.9 11.4,7.7 9.5,10.9 3.7,11 "
      ></polygon>
      <polygon
        fillRule="evenodd"
        fill="currentColor"
        points="11.2,11.9 14.2,6.8 20,6.8 22.9,11.9 20,16.9 14.2,16.9 "
      ></polygon>
      <polygon
        fillRule="evenodd"
        fill="currentColor"
        points="21.9,13.7 19,8.6 20,6.7 22.9,11.9 "
      ></polygon>
      <polygon
        fillRule="evenodd"
        fill="currentColor"
        points="13.2,15.3 19,15.3 21,11.9 21.9,13.7 20,16.9 14.2,17 "
      ></polygon>
      <polygon
        fillRule="evenodd"
        fill="currentColor"
        points="0.8,17.9 3.7,12.8 9.5,12.8 12.4,17.9 9.5,22.9 3.7,22.9 "
      ></polygon>
      <polygon
        fillRule="evenodd"
        fill="currentColor"
        points="11.4,19.7 8.5,14.6 9.5,12.7 12.4,17.9 "
      ></polygon>
      <polygon
        fillRule="evenodd"
        fill="currentColor"
        points="2.7,21.3 8.5,21.3 10.5,17.9 11.4,19.7 9.5,22.9 3.7,23 "
      ></polygon>
    </g>
  </svg>
);

export const ThreadsIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4l3 3 3-3h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
    <path d="M8 7h8" />
    <path d="M8 10h8" />
  </svg>
);

export const BellIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

export const CollectionIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 3v16l5.25-4.2a1.5 1.5 0 0 1 1.5 0L18 19V3H6Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.25 1.5h13.5a.75.75 0 0 1 .75.75v18.3a.75.75 0 0 1-1.21.59l-5.79-4.63a.75.75 0 0 0-.94 0l-5.79 4.63a.75.75 0 0 1-1.21-.59V2.25a.75.75 0 0 1 .75-.75Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ImportIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 14L11.6464 14.3536L12 14.7071L12.3536 14.3536L12 14ZM12.5 5C12.5 4.72386 12.2761 4.5 12 4.5C11.7239 4.5 11.5 4.72386 11.5 5L12.5 5ZM6.64645 9.35355L11.6464 14.3536L12.3536 13.6464L7.35355 8.64645L6.64645 9.35355ZM12.3536 14.3536L17.3536 9.35355L16.6464 8.64645L11.6464 13.6464L12.3536 14.3536ZM12.5 14L12.5 5L11.5 5L11.5 14L12.5 14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 16L5 17C5 18.1046 5.89543 19 7 19L17 19C18.1046 19 19 18.1046 19 17V16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export const QueueIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 21H3a1.5 1.5 0 0 1-1.5-1.5V15.75H3v3.75H21v-3.75h1.5v3.75A1.5 1.5 0 0 1 21 21Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="5.25"
      y="15.75"
      width="13.5"
      height="1.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="5.25"
      y="12"
      width="13.5"
      height="1.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="5.25"
      y="8.25"
      width="13.5"
      height="1.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="5.25"
      y="4.5"
      width="13.5"
      height="1.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PencilIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.232 5.232l3.536 3.536M4 20h4.243l10.607-10.607a1.5 1.5 0 0 0 0-2.121l-2.122-2.122a1.5 1.5 0 0 0-2.121 0L4 15.757V20z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const StartIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 3l14 9-14 9V3z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ShareIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 8a3 3 0 100-6 3 3 0 000 6zM15 8v8M15 16a3 3 0 100 6 3 3 0 000-6zM15 16l-6-4m0-8a3 3 0 100 6 3 3 0 000-6z"
    />
  </svg>
);

export const DeleteIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-4 5v6m-4-6v6M5 6l2 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l2-12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DropdownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 10L12 15L17 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LightbulbIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18C9 17.4477 9.44772 17 10 17H14C14.5523 17 15 17.4477 15 18V19C15 19.5523 14.5523 20 14 20H10C9.44772 20 9 19.5523 9 19V18Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 2C8.68629 2 6 4.68629 6 8C6 10.1217 7.05357 12.1566 9 13.5V15H15V13.5C16.9464 12.1566 18 10.1217 18 8C18 4.68629 15.3137 2 12 2Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SmartNoteIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 32 32"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path d="M25,26a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V5H17V3H5V26a3,3,0,0,0,3,3H24a3,3,0,0,0,3-3V13H25Z"></path>
      <path d="M27.12,2.88a3.08,3.08,0,0,0-4.24,0L17,8.75,16,14.05,21.25,13l5.87-5.87A3,3,0,0,0,27.12,2.88Zm-6.86,8.27-1.76.35.35-1.76,3.32-3.33,1.42,1.42Zm5.45-5.44-.71.7L23.59,5l.7-.71h0a1,1,0,0,1,1.42,0A1,1,0,0,1,25.71,5.71Z"></path>
    </g>
  </svg>
);

export const QuizIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 8l1.5 1.5L11 7" />
    <line x1="13" y1="8" x2="17" y2="8" />
    <path d="M7 14l1.5 1.5L11 13" />
    <line x1="13" y1="14" x2="17" y2="14" />
  </svg>
);

export const FlashcardsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id="mask-card">
      <rect x="0" y="0" width="24" height="24" fill="white" />
      <rect
        x="11"
        y="1"
        width="12"
        height="16"
        rx="2"
        transform="rotate(5 9 4)"
        fill="black"
      />
    </mask>

    <g mask="url(#mask-card)">
      <rect
        x="4"
        y="5"
        width="12"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1"
      />
    </g>

    <rect
      x="11"
      y="1"
      width="12"
      height="16"
      rx="2"
      transform="rotate(5 9 4)"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

export const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 13L9 17L19 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CrossIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CaretDownIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z" />
  </svg>
);

export const TrashIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128h384v320c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
  </svg>
);

export const PlayIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
  </svg>
);

export const ShareAltIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-6 h-6 transition-transform duration-200 hover:scale-105 ${className}`}
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const TimesIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
  </svg>
);

export const Html5Icon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 ${className}`}
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M6 28L4 3H28L26 28L16 31L6 28Z" fill="#E44D26"></path>
      <path d="M26 5H16V29.5L24 27L26 5Z" fill="#F16529"></path>
      <path
        d="M9.5 17.5L8.5 8H24L23.5 11H11.5L12 14.5H23L22 24L16 26L10 24L9.5 19H12.5L13 21.5L16 22.5L19 21.5L19.5 17.5H9.5Z"
        fill="white"
      ></path>
    </g>
  </svg>
);

export const JavaIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="-118.513 4.399 540.906 540.906"
    xmlns="http://www.w3.org/2000/svg"
    fill="#000000"
    className={`w-4 h-4 ${className}`}
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M285.104 430.945h-2.037v-1.14h5.486v1.14h-2.025v5.688h-1.424v-5.688zm10.942.297h-.032l-2.02 5.393h-.924l-2.006-5.393h-.024v5.393h-1.343v-6.828h1.976l1.86 4.835 1.854-4.835h1.969v6.828h-1.311l.001-5.393z"
        fill="#e76f00"
      ></path>
      <path
        d="M102.681 291.324s-14.178 8.245 10.09 11.035c29.4 3.354 44.426 2.873 76.825-3.259 0 0 8.518 5.341 20.414 9.967-72.63 31.128-164.376-1.803-107.329-17.743M93.806 250.704s-15.902 11.771 8.384 14.283c31.406 3.24 56.208 3.505 99.125-4.759 0 0 5.937 6.018 15.271 9.309-87.815 25.678-185.624 2.025-122.78-18.833"
        fill="#5382a1"
      ></path>
      <path
        d="M168.625 181.799c17.896 20.604-4.701 39.146-4.701 39.146s45.439-23.458 24.571-52.833c-19.491-27.395-34.438-41.005 46.479-87.934.001-.001-127.013 31.721-66.349 101.621"
        fill="#e76f00"
      ></path>
      <path
        d="M264.684 321.369s10.492 8.646-11.555 15.333c-41.923 12.7-174.488 16.535-211.314.507-13.238-5.76 11.587-13.752 19.396-15.429 8.144-1.766 12.798-1.437 12.798-1.437-14.722-10.371-95.157 20.363-40.857 29.166 148.084 24.015 269.944-10.814 231.532-28.14M109.499 208.617s-67.431 16.016-23.879 21.832c18.389 2.462 55.047 1.905 89.192-.956 27.906-2.354 55.928-7.358 55.928-7.358s-9.84 4.214-16.959 9.074c-68.475 18.01-200.756 9.631-162.674-8.79 32.206-15.568 58.392-13.802 58.392-13.802M230.462 276.231c69.608-36.171 37.425-70.932 14.96-66.248-5.506 1.146-7.961 2.139-7.961 2.139s2.045-3.202 5.947-4.588c44.441-15.624 78.619 46.081-14.346 70.521 0 0 1.079-.962 1.4-1.824"
        fill="#5382a1"
      ></path>
      <path
        d="M188.495 4.399s38.55 38.562-36.563 97.862c-60.233 47.567-13.735 74.689-.025 105.678-35.158-31.723-60.96-59.647-43.65-85.637 25.406-38.151 95.792-56.648 80.238-117.903"
        fill="#e76f00"
      ></path>
      <path
        d="M116.339 374.246c66.815 4.277 169.417-2.373 171.846-33.987 0 0-4.67 11.984-55.219 21.503-57.027 10.731-127.364 9.479-169.081 2.601.002-.002 8.541 7.067 52.454 9.883"
        fill="#5382a1"
      ></path>
      <path
        d="M105.389 495.049c-6.303 5.467-12.96 8.536-18.934 8.536-8.527 0-13.134-5.113-13.134-13.314 0-8.871 4.937-15.357 24.739-15.357h7.328l.001 20.135m17.392 19.623V453.93c0-15.518-8.85-25.756-30.188-25.756-12.457 0-23.369 3.076-32.238 6.999l2.56 10.752c6.983-2.563 16.022-4.949 24.894-4.949 12.292 0 17.58 4.949 17.58 15.181v7.678h-6.135c-29.865 0-43.337 11.593-43.337 28.993 0 15.018 8.878 23.554 25.594 23.554 10.745 0 18.766-4.437 26.264-10.929l1.361 9.221 13.645-.002zM180.824 514.672h-21.691l-26.106-84.96h18.944l16.198 52.199 3.601 15.699c8.195-22.698 13.992-45.726 16.891-67.898h18.427c-4.938 27.976-13.822 58.684-26.264 84.96M264.038 495.049c-6.315 5.467-12.983 8.536-18.958 8.536-8.512 0-13.131-5.113-13.131-13.314 0-8.871 4.947-15.357 24.748-15.357h7.341v20.135m17.39 19.623V453.93c0-15.518-8.871-25.756-30.186-25.756-12.465 0-23.381 3.076-32.246 6.999l2.557 10.752c6.985-2.563 16.041-4.949 24.906-4.949 12.283 0 17.579 4.949 17.579 15.181v7.678h-6.146c-29.873 0-43.34 11.593-43.34 28.993 0 15.018 8.871 23.554 25.584 23.554 10.752 0 18.77-4.437 26.28-10.929l1.366 9.221 13.646-.002zM36.847 529.099c-4.958 7.239-12.966 12.966-21.733 16.206L6.527 535.2c6.673-3.424 12.396-8.954 15.055-14.104 2.3-4.581 3.252-10.485 3.252-24.604v-96.995h18.478v95.666c-.001 18.875-1.51 26.5-6.465 33.936"
        fill="#e76f00"
      ></path>
    </g>
  </svg>
);

export const PythonIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 ${className}`}
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M13.0164 2C10.8193 2 9.03825 3.72453 9.03825 5.85185V8.51852H15.9235V9.25926H5.97814C3.78107 9.25926 2 10.9838 2 13.1111L2 18.8889C2 21.0162 3.78107 22.7407 5.97814 22.7407H8.27322V19.4815C8.27322 17.3542 10.0543 15.6296 12.2514 15.6296H19.5956C21.4547 15.6296 22.9617 14.1704 22.9617 12.3704V5.85185C22.9617 3.72453 21.1807 2 18.9836 2H13.0164ZM12.0984 6.74074C12.8589 6.74074 13.4754 6.14378 13.4754 5.40741C13.4754 4.67103 12.8589 4.07407 12.0984 4.07407C11.3378 4.07407 10.7213 4.67103 10.7213 5.40741C10.7213 6.14378 11.3378 6.74074 12.0984 6.74074Z"
        fill="url(#paint0_linear_87_8204)"
      ></path>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M18.9834 30C21.1805 30 22.9616 28.2755 22.9616 26.1482V23.4815L16.0763 23.4815L16.0763 22.7408L26.0217 22.7408C28.2188 22.7408 29.9998 21.0162 29.9998 18.8889V13.1111C29.9998 10.9838 28.2188 9.25928 26.0217 9.25928L23.7266 9.25928V12.5185C23.7266 14.6459 21.9455 16.3704 19.7485 16.3704L12.4042 16.3704C10.5451 16.3704 9.03809 17.8296 9.03809 19.6296L9.03809 26.1482C9.03809 28.2755 10.8192 30 13.0162 30H18.9834ZM19.9015 25.2593C19.1409 25.2593 18.5244 25.8562 18.5244 26.5926C18.5244 27.329 19.1409 27.9259 19.9015 27.9259C20.662 27.9259 21.2785 27.329 21.2785 26.5926C21.2785 25.8562 20.662 25.2593 19.9015 25.2593Z"
        fill="url(#paint1_linear_87_8204)"
      ></path>
      <defs>
        <linearGradient
          id="paint0_linear_87_8204"
          x1="12.4809"
          y1="2"
          x2="12.4809"
          y2="22.7407"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#327EBD"></stop>
          <stop offset="1" stop-color="#1565A7"></stop>
        </linearGradient>
        <linearGradient
          id="paint1_linear_87_8204"
          x1="19.519"
          y1="9.25928"
          x2="19.519"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FFDA4B"></stop>
          <stop offset="1" stop-color="#F9C600"></stop>
        </linearGradient>
      </defs>
    </g>
  </svg>
);

export const FilePdfIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 62.9-21.9-12.7-9.6-24.9-23.4-34.5-40.8zM86.1 428.1c0 .8 13.2-5.4 34.9-40.2-6.7 6.3-29.1 24.5-34.9 40.2zM248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.3 10.7 24 24 24zm-8 171.8c-20-12.2-33.3-29-42.7-53.8 4.5-18.5 11.6-46.6 6.2-64.2-4.7-29.4-42.4-26.5-47.8-6.8-5 18.3-.4 44.1 8.1 77-11.5 27.6-28.7 64.6-40.8 85.8-.1 0-.1.1-.2.1-27.1 13.9-73.6 44.5-54.5 68 5.6 6.9 16 10 21.5 10 17.9 0 35.7-18 61.1-61.8 25.8-8.5 54.1-19.1 79-23.2 21.7 11.8 47.1 19.5 64 19.5 29.2 0 31.2-32 19.7-43.4-13.9-13.6-54.3-9.7-73.6-7.2zM377 105L279 7c-4.5-4.5-10.6-7-17-7h-6v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-74.1 255.3c4.1-2.7-2.5-11.9-42.8-9 37.1 15.8 42.8 9 42.8 9z" />
  </svg>
);

export const FileWordIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm57.1 120H305c7.7 0 13.4 7.1 11.7 14.7l-38 168c-1.2 5.5-6.1 9.3-11.7 9.3h-38c-5.5 0-10.3-3.8-11.6-9.1-25.8-103.5-20.8-81.2-25.6-110.5h-.5c-1.1 14.3-2.4 17.4-25.6 110.5-1.3 5.3-6.1 9.1-11.6 9.1H117c-5.6 0-10.5-3.9-11.7-9.4l-37.8-168c-1.7-7.5 4-14.6 11.7-14.6h24.5c5.7 0 10.7 4 11.8 9.7 15.6 78 20.1 109.5 21 122.2 1.6-10.2 7.3-32.7 29.4-122.7 1.3-5.4 6.1-9.1 11.7-9.1h29.1c5.6 0 10.4 3.8 11.7 9.2 24 100.4 28.8 124 29.6 129.4-.2-11.2-2.6-17.8 21.6-129.2 1-5.6 5.9-9.5 11.5-9.5zM384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z" />
  </svg>
);

export const FileExcelIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm60.1 106.5L224 336l60.1 93.5c5.1 8-.6 18.5-10.1 18.5h-34.9c-4.4 0-8.5-2.4-10.6-6.3C208.9 405.5 192 373 192 373c-6.4 14.8-10 20-36.6 68.8-2.1 3.9-6.1 6.3-10.5 6.3H110c-9.5 0-15.2-10.5-10.1-18.5l60.3-93.5-60.3-93.5c-5.2-8 .6-18.5 10.1-18.5h34.8c4.4 0 8.5 2.4 10.6 6.3 26.1 48.8 20 33.6 36.6 68.5 0 0 6.1-11.7 36.6-68.5 2.1-3.9 6.2-6.3 10.6-6.3H274c9.5-.1 15.2 10.4 10.1 18.4zM384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z" />
  </svg>
);

export const FileImageIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9zM248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.3 10.7 24 24 24zm-59.6 109.6l-28.7 28.7c-14.1 14.1-36.8 14.1-50.9 0-14.1-14.1-14.1-36.8 0-50.9s36.8-14.1 50.9 0l28.7 28.7 35.2-35.2c14.1-14.1 36.8-14.1 50.9 0 14.1 14.1 14.1 36.8 0 50.9l-35.2 35.2zM376 32h-80v128h128v-80c0-26.5-21.5-48-48-48z" />
  </svg>
);

export const FolderIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z" />
  </svg>
);

export const UploadIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z" />
  </svg>
);

export const MicrophoneSlashIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L472.1 344.7c15.2-26 23.9-56.3 23.9-88.7V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 21.2-5.1 41.1-14.2 58.7L416 300.8V96c0-53-43-96-96-96s-96 43-96 96v54.3L38.8 5.1zM344 430.4c20.4-2.8 39.7-9.1 57.3-18.2l-43.1-33.9C346.1 382 333.3 384 320 384c-70.7 0-128-57.3-128-128v-8.7L144.7 210c-.5 1.9-.7 3.9-.7 6v40c0 89.1 66.2 162.7 152 174.4V464H248c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H344V430.4z" />
  </svg>
);

export const ChevronLeftIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M7.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L9.81 12l6.47-6.97a.75.75 0 1 0-1.06-1.06l-7.5 7.5z"
      clipRule="evenodd"
    />
  </svg>
);

export const ChevronDoubleLeftIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M10.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L12.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M4.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L6.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z"
      clipRule="evenodd"
    />
  </svg>
);

export const ChevronDoubleRightIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
      clipRule="evenodd"
    />
  </svg>
);

export const ChevronRightIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M16.28 12.53a.75.75 0 0 0 0-1.06l-7.5-7.5a.75.75 0 1 0-1.06 1.06L14.19 12l-6.47 6.97a.75.75 0 1 0 1.06 1.06l7.5-7.5z"
      clipRule="evenodd"
    />
  </svg>
);

export const ExpandIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-4 h-4 ${className}`}
  >
    <polyline points="15 3 21 3 21 9" />
    <line x1="14" y1="10" x2="21" y2="3" />

    <polyline points="3 15 3 21 9 21" />
    <line x1="3" y1="21" x2="10" y2="14" />

    <polyline points="15 21 21 21 21 15" />
    <line x1="14" y1="14" x2="21" y2="21" />

    <polyline points="3 9 3 3 9 3" />
    <line x1="3" y1="3" x2="10" y2="10" />
  </svg>
);

export const CompressIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z" />
  </svg>
);

export const MusicIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z" />
  </svg>
);

export const MusicBotIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="-2 -2 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="40" height="40" fill="transparent" />
    <path
      d="M14 28V12L28 8V24M14 28C14 30.2091 12.2091 32 10 32C7.79086 32 6 30.2091 6 28C6 25.7909 7.79086 24 10 24C12.2091 24 14 25.7909 14 28ZM28 24C28 26.2091 26.2091 28 24 28C21.7909 28 20 26.2091 20 24C20 21.7909 21.7909 20 24 20C26.2091 20 28 21.7909 28 24Z"
      stroke="var(--primary)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(2, 1) scale(0.95)"
    />
  </svg>
);

export const MessageIcon = ({ className = "" }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M22 2L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AddFriendIcon = ({ className = "" }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 8V14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 11H17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className={`close-icon ${className}`}
  >
    <path
      d="M18 6L6 18"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EllipsisVIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-5 h-5 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
      clipRule="evenodd"
    />
  </svg>
);

export const DoorOpenIcon = ({ className = "" }: { className?: string }) => (
  <div className="door-icon-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="white"
      className={`door-icon-svg ${className}`}
    >
      <path d="M11.654 3.25a.75.75 0 01.692 0l8.25 4.5A.75.75 0 0121 8.31v7.94a.75.75 0 01-1.404.45l-1.12-1.875a.75.75 0 00-.652-.375H6.176a.75.75 0 00-.652.375l-1.12 1.875A.75.75 0 013 16.25V8.31a.75.75 0 01.404-.56l8.25-4.5z" />
      <path d="M4.176 11.75a.75.75 0 01.652-.375h14.344a.75.75 0 01.652.375l1.12 1.875A.75.75 0 0121 14.31v1.94a.75.75 0 01-1.404.45l-1.12-1.875a.75.75 0 00-.652-.375H6.176a.75.75 0 00-.652.375l-1.12 1.875A.75.75 0 013 16.25v-1.94a.75.75 0 011.404-.56l1.12 1.875z" />
    </svg>
  </div>
);

export const CommentSlashIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-6 h-6 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.706 8.99a.75.75 0 10-1.06 1.06L10.94 12l-3.294 3.294a.75.75 0 101.06 1.06L12 13.06l3.294 3.294a.75.75 0 101.06-1.06L13.06 12l3.294-3.294a.75.75 0 00-1.06-1.06L12 10.94 8.706 7.646z"
      clipRule="evenodd"
    />
  </svg>
);

export const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
      clipRule="evenodd"
    />
  </svg>
);

export const SearchMinusIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-6 h-6 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5zm4.5 0a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export const UsersSlashIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-6 h-6 ${className}`}
  >
    <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.5 17.69c0 .471-.202.86-.504 1.124l-4.746-4.746V7.939l2.69-2.689c.944-.945 2.56-.276 2.56 1.06v11.38zM15.75 7.5v5.068L7.682 4.5h5.068a3 3 0 013 3zM1.5 7.5c0-.782.3-1.494.79-2.028l12.846 12.846A2.995 2.995 0 0112.75 19.5H4.5a3 3 0 01-3-3v-9z" />
  </svg>
);

export const CommentDotsIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-6 h-6 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
      clipRule="evenodd"
    />
  </svg>
);

export const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
      clipRule="evenodd"
    />
  </svg>
);

export const UsersIcon2 = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
  </svg>
);

export const PhoneIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
      clipRule="evenodd"
    />
  </svg>
);

export const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
      clipRule="evenodd"
    />
  </svg>
);

export const ChevronUpIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 01-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 11-1.06-1.06l7.5-7.5z"
      clipRule="evenodd"
    />
  </svg>
);

export const FileIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
      clipRule="evenodd"
    />
    <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
  </svg>
);

export const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
      clipRule="evenodd"
    />
  </svg>
);

export const UsersIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
      clipRule="evenodd"
    />
    <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
  </svg>
);

export const UserFriendsIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
      clipRule="evenodd"
    />
  </svg>
);

export const UserTagIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      clipRule="evenodd"
    />
  </svg>
);

export const PlusIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export const HashtagIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M11.097 1.515a.75.75 0 01.589.882L10.666 7.5h4.47l1.079-5.397a.75.75 0 111.47.294L16.665 7.5h3.585a.75.75 0 010 1.5h-3.885l-1.2 6h3.585a.75.75 0 010 1.5h-3.885l-1.08 5.397a.75.75 0 11-1.47-.294l1.02-5.103h-4.47l-1.08 5.397a.75.75 0 01-1.47-.294l1.02-5.103H3.75a.75.75 0 110-1.5h3.885l1.2-6H5.25a.75.75 0 010-1.5h3.885l1.08-5.397a.75.75 0 01.882-.588zM10.365 9l-1.2 6h4.47l1.2-6h-4.47z"
      clipRule="evenodd"
    />
  </svg>
);

export const BoltIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
      clipRule="evenodd"
    />
  </svg>
);

export const KanbanIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 ${className}`}
  >
    <path
      d="M9.6 4H4.4C3.6268 4 3 4.6268 3 5.4V19.6C3 20.3732 3.6268 21 4.4 21H9.6C10.3732 21 11 20.3732 11 19.6V5.4C11 4.6268 10.3732 4 9.6 4Z"
      fill="currentColor"
    />
    <path
      d="M19.6 4H15.4C14.6268 4 14 4.6268 14 5.4V14.6C14 15.3732 14.6268 16 15.4 16H19.6C20.3732 16 21 15.3732 21 14.6V5.4C21 4.6268 20.3732 4 19.6 4Z"
      fill="currentColor"
    />
  </svg>
);

export const HouseUserIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
  </svg>
);

export const GlobeIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M93.8,114.6c-4.7,1.1-1.7,0.9-5.6,1.4C71.5,119.6,83.9,122.8,93.8,114.6z M387.5,121.3c1.2-0.8,5.4-4.9-7.7-8.9 c0.8,4.1-2.7,3.7-2.7,6c9.7,8.8,13.7,24.1,26.1,27.3C405.6,134.7,392.2,129.3,387.5,121.3z M84.9,111.4c1.5,8.9,8.2-9.4,8.3-15.9 c-2.6,1.5-5.2,3-7.9,4.2c6.3,3.2,0.8,6.6-6,11.7C65.5,128.6,92.2,98,84.9,111.4z M256,0C114.6,0,0,114.6,0,256 c0,141.3,114.6,256,256,256c141.4,0,256-114.7,256-256C512,114.6,397.4,0,256,0z M262.8,85.8l1.2,0.4c-4.8,6.2,25,24.3,3.6,25.8 c-20,5.7,8.4-5.2-7.1-3.3C268.7,97.3,254,97.1,262.8,85.8z M141.4,102.2c-7.2-6-29.8,8.2-21.9,4.8c19.6-7.7,1.3,0.8,5.9,10 c-4.2,8.7-1.4-8.6-11.8,1.7c-7.5,1.7-25.9,18.7-23.6,13.5c-0.6,8.1-21.9,17.7-24.8,31.2c-7,18.7-1.7-0.7-3-8 c-10-12.7-28.2,21.5-22.8,35c9.1-16,8.4-1.7,1.8,5.4c6.7,12.3-6.1,28.3,6.6,37.4c5.6,1.3,16.8-18.8,11.9,2.1 c3.4-18.1,9.4,4.3,19.1-0.7c0.6,9.5,6.5,5.1,7.8,16.6c16.2-1.2,31,26.2,11.7,31.4c2.9-0.8,8.6,4.3,15.2,0.4 c11.2,8.9,40.7,10,41.5,32c-20.3,9.7-5,36.3-22.6,45.8c-20.2-3-6.9,24.9-15.4,21.7c3.4,20.1-20.4-2.6-11.2,8.5 c16.9,10.4-7.4,8.3,0.2,15.9c-8.5-1.8,5.3,15.8,7.6,22.3c12.2,19.8-10.5-4.4-17.2-11c-6.4-12.8-21.5-37.3-25.7-57.4 c-2.4-29.2-25-48.8-30.2-77.3c-5.2-15.9,14.3-41.4,3.8-50.3c-9.1-7.1-5.4-31.4-10.8-44.2c13.5-58.5,56.4-107.8,107.9-137 c-5.3,3.9,30.3-10.1,26.2-6.7c-1.1,2.5,20.8-9.5,34-11.3c-1.4,0.2-34.3,12-25.2,10.4c-14.1,6.9-1.4,3,5.6-0.5 c-14,10.3-24.8,7.4-40.7,16.5c-16,4.2-12.7,20.8-24.1,29.1c6.7,1.2,23.5-17.3,33.3-23.8c22.5-10.9-11.4,19.8,10,6.6 c-7.2,6.7-5.7,17.4-10.1,20.4C148.2,92.1,159.1,97.9,141.4,102.2z M176.4,56.2c-2.3,3.1-5.5,9.8-7.4,5.7c-2.6,1.3-3.6,6.9-8.5,2.4 c2.9-2.1,5.9-7.1,0.2-4c2.6-2.8,25.8-10.7,24.5-13.7c4.1-2.6,3.7-3.9-1-2.3c-2.4-0.8,5.7-7.6,16.5-8.5c1.5,0,2.1,1-0.6,0.7 c-16.3,5-9.3,3.6,1.7,0c-4.2,2.4-7.1,3.1-7.8,4.2c11-4-0.6,2.9,1.9,2.4c-3.1,1.6,0.5,2.1-5.5,4.4c1.1-0.9-9.8,6.5-3.3,4.3 C180.8,57.8,178,57.9,176.4,56.2z M186,70.5c0.2-9.6,14-15.7,12.3-16.2c17-8-5.9,0.3,7.5-6.9c5-0.5,15.6-16.5,30.3-17.5 c16.2-4.9,8.7,0.3,20.7-4.3l-2.4,2c-2.1,0.3,0.5,4-7.1,9.6c-0.8,8.7-14.5,4.7-7.7,14c-4.4-6.3-11-0.2-2.7,0.4 c-8.9,6.8-29.6,8-39.5,19.3C191,80.1,185.1,77.2,186,70.5z M257.1,102.5c-6.8,16.4-13.4-2.4-1.4-5.4 C258.7,98.7,259.9,99.2,257.1,102.5z M231.5,69.7c-2-7.4-0.4-3.5,11.5-7C251.2,68.6,235.7,72.5,231.5,69.7z M417.7,363.2 c-9.4-16.2,11.4-31.2,18.4-44.8C435.2,334.3,433.2,350,417.7,363.2z M453.1,178.1c-10.2,0.8-19.4,3.2-28.6-2.6 c-21.2-23.2,3.9,26.2,10.9,6c25.2,9.6-0.4,51-16.3,46.7c-8.9-19.2-19.9-40.3-39.3-49.7c14.9,16.5,22.3,36.8,38.3,51.7 c1.1,20.8,22.2-7.6,20.9,8.5c2,27.7-31.3,44.3-25.5,72.1c12.4,25.3-23.9,29.9-19.8,52.6c-14.6,16.3-30.2,38.3-56.4,34.8 c0-13.8-7-25.5-8.6-39.7c-14.2-18,15-37.3-3.1-56.1c-20.9-4.7,4.3-33.5-17.2-30.8c-12.9-12.9-31.8-0.4-50.3-0.3 c-23.2,2.2-47.1-28.5-36.8-50.2c-8.2-22.6,26-29.2,26.9-49.1c16.4-13.7,39.7-12,61.9-15.2c-1.6,15.9,15.2,16,27.9,21.3 c7.1-17.2,29.2,2.8,44.3-8.1c5.2-25.4-14.7-10.1-26.1-18.2c-13.8-20.2,29.5-10.4,25-21c-16.8-0.1-7.3-20.7-19.2-9.2 c10.7,1.9-1.9,10.3-1.6,0.7c-16.2-4.7-0.6,18.4-8.8,20.6c-12.5-5.2-6.6,5.9-5.3,7.6c-5.4,11.7-12-17.2-27.3-16.4 c-15.2-13.9-6,6.3,7.2,9.6c-2.8,0.8,1.6,12.3-1.9,7.4c-10.9-15-31.6-25-43.9-6.6c-1.3,17.2-36.3,22.1-30.7,2 c-8.2-20.8,25.4-0.6,22.3-17.2c-21.6-14.3,5.9-9.7,13.2-23.1c16.6,0.5,0.7-13.6,8.5-17.7c-0.8,15.3,12.7,12.4,23.4,9.5 c-2.6-8.8,6.4-8.5,0.9-15.8c24.8-9.9-18.9,4.6-10.1-17.1c-10.7-7.4-4.5,16.3,0,18.8c0.3,7.3-5.9,16.3-14.4,1 c-12.4,8.1-11.1-8.2-11.9-6.5c-1.4-6.3,9.4-6.6,9.5-17.6c-0.9-7-0.7-10.7,4.3-11.1c0.4,1,20.5,1.3,27.6,9.6 c-19.4-3.9-2.9,3.2,5.8,7.2c-9.3-7.3,3.7,0-3.9-8.3c3,0.6-8.3-11.4,3.3-0.9c-6.3-7.5,12.3-5.3,1.3-10.9c16.1,4.5,6.6,0.4-2.9-3.7 c-26.2-15.6,46.3,21.1,16.7,4.8c18.9,4.1-40.4-14.6-13.4-6.4c-10.3-4.5-0.3-2,9,0.9c-16.7-5.2-41.7-14.9-40.7-15.3 c5.8,0.4,11.5,1.7,17,3.3c17.1,5.1-4.9-1.2-0.2-1.1C373.8,44,425.3,83.4,456.6,134.9c7.3,7.7,27.2,58.6,16.8,36 c4.7,18,5.4,37.4,7.9,55.8c-5.2-5.8-11-27.2-16-39.1C463.2,192.2,460.8,181.1,453.1,178.1z" />
  </svg>
);

export const CommentsIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
      clipRule="evenodd"
    />
  </svg>
);

export const CodeIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M14.447 3.027a.75.75 0 01.527.92l-4.5 16.5a.75.75 0 01-1.448-.394l4.5-16.5a.75.75 0 01.921-.526zM16.72 6.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 010-1.06zm-9.44 0a.75.75 0 010 1.06L2.56 12l4.72 4.72a.75.75 0 11-1.06 1.06L.97 12.53a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
      clipRule="evenodd"
    />
  </svg>
);

export const ChalkboardIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 11-9 0V4.125zm4.5 14.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z"
      clipRule="evenodd"
    />
    <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.743c-.09.089-.18.175-.274.257zM12.738 17.625l6.474-6.474a1.875 1.875 0 000-2.651L15.5 4.787a1.875 1.875 0 00-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375z" />
  </svg>
);

export const CogIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export const SmileIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.59 14.37a5 5 0 01-7.18 0M9 9.75h.008v.008H9V9.75zm6 0h.008v.008H15V9.75z"
    />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} />
  </svg>
);

export const EyeIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
  >
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path
      fillRule="evenodd"
      d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
      clipRule="evenodd"
    />
  </svg>
);
