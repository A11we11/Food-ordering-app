import React from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  className = "",
}) => {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= rating;
    const isHalfFilled = i === Math.ceil(rating) && rating % 1 !== 0;

    stars.push(
      <span
        key={i}
        className={`star ${isFilled ? "filled" : ""} ${
          isHalfFilled ? "half" : ""
        }`}
        style={{
          fontSize: `${size}px`,
          color: isFilled ? "#ffd700" : "#ddd",
          marginRight: "2px",
        }}
      >
        ★
      </span>
    );
  }

  return (
    <div
      className={`star-rating ${className}`}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      {stars}
      <span style={{ marginLeft: "6px", fontSize: "12px", color: "#666" }}>
        ({rating})
      </span>
    </div>
  );
};

export default StarRating;
