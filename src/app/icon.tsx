import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// PizzaHub icon: #E20001 circular badge with a white pizza slice.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#E20001',
          borderRadius: '50%',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          {/* White pizza slice: crust at the top, tip at the bottom */}
          <path d="M3.4 4.5 L20.6 4.5 L12 21 Z" fill="#FFFFFF" />
          {/* Pepperoni */}
          <path
            d="M8.8 8.6 a1.7 1.7 0 1 0 3.4 0 a1.7 1.7 0 1 0 -3.4 0 Z"
            fill="#E20001"
          />
          <path
            d="M13.6 11.8 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 Z"
            fill="#E20001"
          />
          <path
            d="M9.4 14.4 a1.5 1.5 0 1 0 3 0 a1.5 1.5 0 1 0 -3 0 Z"
            fill="#E20001"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
