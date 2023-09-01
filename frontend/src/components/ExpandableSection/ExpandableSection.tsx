import React, { useState } from 'react';
import './ExpandableSection.css';
import dropdownArrowIcon from '../../assets/img/icons/dropdown_arrow.svg';

type Props = {
  title: string
  children: React.ReactNode
  disableCollapse?: boolean
  className?: string
};

function ExpandableSection({
  title, children, disableCollapse, className,
}: Props) {
  const [expanded, setExpanded] = useState<boolean>(true);

  const toggleExpanded = () => {
    if (disableCollapse) {
      return;
    }

    setExpanded(!expanded);
  };

  return (
    <div className={`expandable-section${expanded ? ' expandable-section--active' : ''}`}>
      <button
        type="button"
        className="expandable-section__header"
        onClick={toggleExpanded}
        disabled={disableCollapse}
      >
        <img
          src={dropdownArrowIcon}
          alt="Dropdown arrow"
          className="expandable-section__header__dropdown_arrow"
        />
        <h2 className="expandable-section__header__title">{title}</h2>
      </button>

      {/* Hidden in the CSS (faster performance) */}
      <div className={`expandable-section__content ${className || ''}`}>
        {children}
      </div>
    </div>
  );
}

ExpandableSection.defaultProps = {
  className: undefined,
  disableCollapse: false,
};

export default ExpandableSection;
