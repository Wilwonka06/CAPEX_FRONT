import PropTypes from "prop-types";
import { truncateText } from "../validations";

const TruncatedText = ({ 
  text, 
  maxLength = 30, 
  maxWidth = "max-w-[200px]", 
  className = "", 
  showTooltip = true 
}) => {
  const truncated = truncateText(text, maxLength);
  const isTruncated = text && text.length > maxLength;

  return (
    <div 
      className={`${maxWidth} ${className}`}
      title={showTooltip && isTruncated ? text : undefined}
    >
      {truncated}
    </div>
  );
};

TruncatedText.propTypes = {
  text: PropTypes.string,
  maxLength: PropTypes.number,
  maxWidth: PropTypes.string,
  className: PropTypes.string,
  showTooltip: PropTypes.bool,
};

export default TruncatedText; 