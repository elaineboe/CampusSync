export default function Logo({ width = 120, height = 120, className = "" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            width={width}
            height={height}
            className={className}
        >
            <g transform="translate(10, 10) scale(0.9)">
                {/* Shield / Calendar Base */}
                <path
                    d="M 20 80 L 100 110 L 180 80 L 180 160 Q 100 200 100 200 Q 100 200 20 160 Z"
                    fill="#1E3A5F"
                />
                {/* Inner Light Blue Shape */}
                <path
                    d="M 30 100 L 100 120 L 170 100 L 170 150 Q 100 185 100 185 Q 100 185 30 150 Z"
                    fill="#2563EB"
                />
                {/* Checkmark */}
                <path
                    d="M 60 130 L 90 160 L 150 100"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Small square details */}
                <rect x="40" y="110" width="15" height="15" fill="#60A5FA" />
                <rect x="40" y="135" width="15" height="15" fill="#1F2937" />
                <rect x="145" y="135" width="15" height="15" fill="#60A5FA" />

                {/* Top Nodes */}
                <circle cx="50" cy="40" r="12" fill="#1E3A5F" />
                <circle cx="100" cy="65" r="10" fill="#2563EB" />
                <circle cx="150" cy="40" r="12" fill="#2563EB" />

                {/* Node connections */}
                <path
                    d="M 50 52 L 100 65"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4"
                />
                <path
                    d="M 150 52 L 100 65"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4"
                />
                <path
                    d="M 100 20 L 100 55"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4"
                />

                {/* Top Center Node */}
                <circle cx="100" cy="20" r="12" fill="#1E3A5F" />

                {/* Top Folder Tab cuts */}
                <path
                    d="M 40 80 L 40 65 Q 50 65 50 80 Z"
                    fill="#FFFFFF"
                />
                <path
                    d="M 140 80 L 140 65 Q 150 65 150 80 Z"
                    fill="#FFFFFF"
                />
            </g>
        </svg>
    );
}
