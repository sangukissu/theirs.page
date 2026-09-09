import { ImageResponse } from "next/og"

export const alt = "Theirs — Online Memorial Website for Loved Ones"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FAFAF8",
          padding: "64px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar: Brand & Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "20px",
                backgroundColor: "#181925",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FAFAF8",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              T
            </div>
            <span
              style={{
                fontSize: "30px",
                fontWeight: 600,
                color: "#181925",
                letterSpacing: "-0.02em",
              }}
            >
              Theirs
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: "999px",
              backgroundColor: "rgba(24, 25, 37, 0.05)",
              border: "1px solid rgba(24, 25, 37, 0.08)",
              fontSize: "15px",
              fontWeight: 500,
              color: "#555555",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Online Memorials
          </div>
        </div>

        {/* Center: Main Headline and Subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
          }}
        >
          <h1
            style={{
              fontSize: "58px",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#181925",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Create a beautiful online memorial for someone you love.
          </h1>
          <p
            style={{
              fontSize: "24px",
              lineHeight: 1.45,
              color: "#666666",
              margin: 0,
              maxWidth: "840px",
            }}
          >
            Bring their photos, stories and tributes together in one place, and invite family and friends to add their memories.
          </p>
        </div>

        {/* Bottom bar: Tagline & Domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(24, 25, 37, 0.08)",
            paddingTop: "28px",
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              color: "#777777",
            }}
          >
            A calm, dignified place for family memories
          </span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 500,
              color: "#181925",
            }}
          >
            theirs.page
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
