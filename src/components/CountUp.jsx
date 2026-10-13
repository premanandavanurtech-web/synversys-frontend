import React, { useState, useEffect, useRef } from "react";

/**
 * Parses numeric strings with optional prefixes, suffixes, commas, and decimals.
 * Examples:
 *   "500+"  => { end: 500, prefix: "", suffix: "+", decimals: 0, hasCommas: false }
 *   "50K+"  => { end: 50,  prefix: "", suffix: "K+", decimals: 0, hasCommas: false }
 *   "99.9%" => { end: 99.9, prefix: "", suffix: "%", decimals: 1, hasCommas: false }
 *   "1,284" => { end: 1284, prefix: "", suffix: "", decimals: 0, hasCommas: true }
 */
function parseValue(val) {
  if (typeof val === "number") {
    return { end: val, prefix: "", suffix: "", decimals: 0, hasCommas: false };
  }
  const str = String(val ?? "").trim();
  const hasCommas = str.includes(",");
  const clean = str.replace(/,/g, "");
  const match = clean.match(/^([^0-9.]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (match) {
    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
    return { end: parseFloat(numStr), prefix, suffix, decimals, hasCommas };
  }
  return { end: 0, prefix: "", suffix: str, decimals: 0, hasCommas: false };
}

// Ease-out cubic for smooth and energetic deceleration
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * CountUp Component
 * Animates numbers starting from 0 (or start prop) to the target value on page load/reload.
 */
export default function CountUp({
  value,
  start = 0,
  end: endProp,
  decimals: decimalsProp,
  prefix: prefixProp,
  suffix: suffixProp,
  duration = 2000,
  delay = 0,
  triggerOnInView = true,
  once = true,
  component: Component = "span",
  className,
  style,
  ...props
}) {
  const parsed = parseValue(value);
  const end = typeof endProp === "number" ? endProp : parsed.end;
  const decimals = typeof decimalsProp === "number" ? decimalsProp : parsed.decimals;
  const prefix = prefixProp !== undefined ? prefixProp : parsed.prefix;
  const suffix = suffixProp !== undefined ? suffixProp : parsed.suffix;
  const hasCommas = parsed.hasCommas;

  const formatNumber = (num) => {
    let formatted;
    if (decimals > 0) {
      formatted = num.toFixed(decimals);
    } else {
      formatted = Math.round(num).toString();
    }

    if (hasCommas) {
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      formatted = parts.join(".");
    }

    return `${prefix}${formatted}${suffix}`;
  };

  // Start initially from zero
  const [displayValue, setDisplayValue] = useState(() => formatNumber(start));
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef(null);

  // Intersection check - detect if visible or wait until scrolled into view
  useEffect(() => {
    const node = containerRef.current;
    if (!triggerOnInView || typeof IntersectionObserver === "undefined" || !node) {
      setHasTriggered(true);
      return;
    }

    // Immediate check if element is already inside the viewport (e.g. on page load/reload)
    try {
      const rect = node.getBoundingClientRect();
      const inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
      if (inView) {
        setHasTriggered(true);
        if (once) return;
      }
    } catch (e) {
      // Fallback to observer
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasTriggered(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setHasTriggered(false);
            setDisplayValue(formatNumber(start));
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [triggerOnInView, once, start]);

  // Run the count-up animation when triggered
  useEffect(() => {
    if (!hasTriggered) return;

    let animationFrameId;
    let delayTimeoutId;
    let startTime = null;

    const startAnimation = () => {
      const step = (timestamp) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const rawProgress = Math.min(1, Math.max(0, elapsed / duration));
        const easedProgress = easeOutCubic(rawProgress);
        const currentVal = start + (end - start) * easedProgress;

        setDisplayValue(formatNumber(currentVal));

        if (rawProgress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(formatNumber(end));
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    if (delay > 0) {
      delayTimeoutId = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (delayTimeoutId) clearTimeout(delayTimeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [hasTriggered, end, start, duration, delay, decimals, prefix, suffix, hasCommas]);

  return (
    <Component ref={containerRef} className={className} style={style} {...props}>
      {displayValue}
    </Component>
  );
}
