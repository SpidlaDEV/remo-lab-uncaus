import React from "react";

type RemoteLabLogoProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
};

export default function RemoteLabLogo({
                                          size = 48,
                                          ...props
                                      }: RemoteLabLogoProps) {
    return (
        <svg
            viewBox="0 0 190 210"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* monitor */}
            <line x1="20" y1="50" x2="82" y2="50" />
            <line x1="108" y1="50" x2="170" y2="50" />
            <line x1="20" y1="145" x2="170" y2="145" />
            <line x1="20" y1="135" x2="170" y2="135" />
            <line x1="20" y1="50" x2="20" y2="145" />
            <line x1="170" y1="50" x2="170" y2="145" />

            {/* moléculas */}
            <circle cx="48" cy="68" r="9" />
            <line x1="48" y1="68" x2="65" y2="78" />
            <circle cx="40" cy="105" r="8" />
            <line x1="40" y1="105" x2="62" y2="100" />
            <circle cx="150" cy="115" r="9" />
            <line x1="150" y1="115" x2="128" y2="106" />

            {/* matraz */}
            <circle cx="95" cy="95" r="32" />

            {/* cuello */}
            <line x1="85" y1="35" x2="85" y2="63" />
            <line x1="105" y1="35" x2="105" y2="63" />

            {/* boca */}
            <ellipse cx="95" cy="35" rx="10" ry="5" />

            {/* líquido */}
            <line x1="65" y1="105" x2="123" y2="95" />

            {/* base monitor */}
            <line x1="70" y1="180" x2="120" y2="180" />
            <line x1="95" y1="145" x2="95" y2="180" />
        </svg>
    );
}