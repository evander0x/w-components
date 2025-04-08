import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import styled from 'styled-components';

import { ReactComponent as ResetIconDisabled } from '../assets/svg/common/reset-icon-disabled.svg';
import { ReactComponent as ResetIconActive } from '../assets/svg/common/reset-icon-active.svg';
import { ReactComponent as InIcon } from '../assets/svg/common/in-icon.svg';
import { ReactComponent as OutIcon } from '../assets/svg/common/out-icon.svg';
import { ReactComponent as RangeIcon } from '../assets/svg/common/range-icon.svg';
import { Button } from '@ubnt/ui-components/Button';

import { InfoTooltip } from '../UITooltip/InfoTooltip';
import Slider from '@ubnt/ui-components/Slider/Slider';
import throttle from 'lodash/throttle';

import './style.scss';

import OverflowContainer from '../OverflowContainer';

const HeaderCmp = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;

  padding: 20px 0;
  padding-bottom: 16px;

  .handle-img-mes {
    display: flex;
    max-width: 500px;
    .preview-name {
      color: #212327;
      font-size: 14px;
      font-weight: 700;
      line-height: 20px;
    }

    .preview-size {
      margin-left: 14px;
      color: #808893;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      white-space: nowrap;
    }
  }

  .handle-img-option {
    display: flex;
    gap: 16px;
    width: 376px;
    justify-content: center;
    align-items: center;

    .handle-icon-item {
      width: 20px;
      height: 20px;

      cursor: pointer;
      color: #808893;

      &.disabled {
        cursor: default;
        color: #dee0e3;
      }
    }

    .slider-content {
      width: 200px !important;
      height: 1px;
    }
  }
`;

const FooterCmp = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  button {
    width: auto;
  }
`;

const initSize = 50;
const min = 1;
const multi = 2;
const step = 50;

const dragThreshold = 5;

let timer = null;

const initContainerWidth = 960;
const initContainerHeight = 576;

const ZoomableDraggableImage = forwardRef(
  (
    {
      src,
      currentPreviewObj,
      transformTime,
      setTransformTime,
      // g-props
      onRequestClose,
    },
    ref
  ) => {
    // relative container
    const [scale, setScale] = useState(1);
    const [dragging, setDragging] = useState(false);

    // dragg model: isZoomed
    const [isZoomed, setIsZoomed] = useState(false);

    const imgRef = useRef(null);
    const imgBoxRef = useRef(null);
    const containerRef = useRef(null);
    const rangeRef = useRef(null);

    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [containerWidth, setContainerWidth] = useState(initContainerWidth);
    const [containerHeight, setContainerHeight] = useState(initContainerHeight);

    // start / end
    const [startMousePosition, setStartMousePosition] = useState({
      x: 0,
      y: 0,
    });
    const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

    const [intiPosition, setIntiPosition] = useState({ x: 0, y: 0 });

    const [isHovered, setIsHovered] = useState(false);

    // limit remove range
    const [minPosition, setMinPosition] = useState({ x: 0, y: 0 });
    const [maxPosition, setMaxPosition] = useState({ x: 0, y: 0 });

    const [imgBoxStyle, setImgBoxStyle] = useState({
      width: containerWidth,
      height: containerHeight,
    });

    const initRangeLimit = {
      minObj: {
        number: min * step,
        ratio: 1,
      },
      maxObj: {
        number: multi * step,
        ratio: 2,
      },
    };

    const [rangeLimit, setRangeLimit] = useState(initRangeLimit);

    const [value, setValue] = useState(initSize);
    const [containerSize, setContainerSize] = useState({
      width: initContainerWidth,
      height: initContainerHeight,
    });

    // update container size
    useEffect(() => {
      updateSize();
      window.addEventListener('resize', updateSize);

      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }, [currentPreviewObj]);

    useEffect(() => {
      setContainerHeight(containerSize.height);
    }, [containerSize, currentPreviewObj]);

    useEffect(() => {
      const img = imgRef.current;
      const container = containerRef.current;

      if (img && container) {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        setImgBoxStyle({
          width: imgWidth,
          height: imgHeight,
        });

        if (imgWidth <= containerWidth && imgHeight <= containerHeight) {
          // donot scale img
          return;
        }

        const widthRatio = containerWidth / imgWidth;
        const heightRatio = containerHeight / imgHeight;
        const initialScale = Math.min(widthRatio, heightRatio).toFixed(2);

        scalcImgFun({
          initRatio: -(1 - initialScale),
          isCustomCalc: true,
          isSetInitPosition: true,
          scale,
        });
        setRangeLimit({
          minObj: {
            number: Number(1 * initialScale * step),
            ratio: Number(initialScale),
          },
          maxObj: {
            number: Number(multi * step),
            ratio: 2,
          },
        });
      }
    }, [src, currentPreviewObj]);

    useEffect(() => {
      const handleMouseUpOutside = () => {
        setDragging(false);
      };

      window.addEventListener('mouseup', handleMouseUpOutside);

      return () => {
        window.removeEventListener('mouseup', handleMouseUpOutside);
      };
    }, [currentPreviewObj]);

    const updateSize = () => {
      const element = document.querySelector('.approval-preview-modal-new');
      if (element) {
        const rect = element.getBoundingClientRect();
        setContainerSize({
          // width: rect.width > 700 ? initContainerWidth : rect.width,
          width: rect.width,
          height:
            rect.height > 700
              ? initContainerHeight
              : rect.height - (700 - initContainerHeight),
        });
      }
    };

    // src
    const toggleImgInitConfig = () => {
      setPosition({ x: 0, y: 0 });
      setScale(1);
      setIntiPosition({ x: 0, y: 0 });
      setMaxPosition({ x: 0, y: 0 });
      setMinPosition({ x: 0, y: 0 });
      setValue(initSize);
      setRangeLimit(initRangeLimit);
    };

    useImperativeHandle(ref, () => ({
      someFunction() {
        toggleImgInitConfig();
      },
    }));

    const imgRatio = useMemo(() => {
      return Math.round((value / 50) * 100) + '%';
    }, [value, currentPreviewObj]);

    const isDrag = isZoomed || value > rangeLimit.minObj.number;

    const displayFileSize = useMemo(() => {
      let size = currentPreviewObj.size || 0;
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
      if (size < 1024 * 1024 * 1024)
        return (size / 1024 / 1024).toFixed(2) + ' MB';
      return '';
    }, [currentPreviewObj]);

    const handleMouseDown = event => {
      setTransformTime('0.3');
      event?.stopPropagation();
      // if (!isDrag) return;
      setDragging(true);
      setStartMousePosition({ x: event.clientX, y: event.clientY });
      setLastMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = event => {
      if (!dragging || value <= rangeLimit.minObj.number) return;

      setDragging(true);

      timer && clearTimeout(timer);
      timer = setTimeout(() => {
        containerRef.current.style.cursor = 'grab';
      }, 0);

      const { x, y } = limitRemomeRange(event);
      setPosition(() => {
        return {
          x,
          y,
        };
      });

      setLastMousePosition({ x: event.clientX, y: event.clientY });
    };

    const limitRemomeRange = event => {
      const dx = event.clientX - lastMousePosition.x;
      const dy = event.clientY - lastMousePosition.y;

      const newX = position.x + dx;
      const newY = position.y + dy;

      const X =
        newX > maxPosition.x
          ? maxPosition.x
          : newX <= minPosition.x
          ? minPosition.x
          : newX;
      const Y =
        newY > maxPosition.y
          ? maxPosition.y
          : newY <= minPosition.y
          ? minPosition.y
          : newY;

      // Cannot be moved out of the container'
      // containerRef: top position
      // containerRef: left position

      return {
        x: X,
        y: Y,
      };
    };

    const handleMouseUp = event => {
      setDragging(false);

      const movedX = Math.abs(event.clientX - startMousePosition.x);
      const movedY = Math.abs(event.clientY - startMousePosition.y);

      if (movedX < dragThreshold && movedY < dragThreshold) {
        toggleZoom(event);
      }

      containerRef.current.style.cursor =
        +(+value).toFixed(2) > rangeLimit.minObj.number
          ? 'zoom-out'
          : 'zoom-in';

      timer && clearTimeout(timer);

      containerRef.current.removeEventListener('mousemove', handleMouseMove);
      containerRef.current.removeEventListener('mouseup', handleMouseUp);
    };

    const initImg = () => {
      setPosition(intiPosition);
      setScale(rangeLimit.minObj.ratio);
      setValue(rangeLimit.minObj.number);
    };

    const toggleZoom = event => {
      event?.preventDefault();
      const newZoomState = !isZoomed;
      setIsZoomed(newZoomState);
      imgBoxRef.current.style.transition = `transform ${transformTime}s ease`;
      if (newZoomState) {
        throttledScalcImgFun({ event, scale });
      } else {
        initImg();
      }
    };

    const scalcImgFun = ({
      event = {
        clientX: 1,
        clientY: 1,
      },
      initRatio,
      isCustomCalc,
      isSetInitPosition,
      scale,
    }) => {
      let result,
        // init scale
        currentRatio = scale,
        translateX = position.x,
        translateY = position.y;

      const img = imgRef.current;
      const imgBox = imgBoxRef.current;
      const imgBoxRect = imgBox.getBoundingClientRect();

      result = { width: img.naturalWidth, height: img.naturalHeight };
      imgBox.style.transformOrigin = '0 0';
      const rect = imgBoxRect;

      // ratio: change value
      // currentRatio:  1.2 => 1.3 , ratio = 0.1
      let preRatio = initRatio
        ? initRatio
        : rangeLimit.minObj.ratio < 1
        ? 1 - currentRatio
        : 1;

      currentRatio += preRatio;

      let mousePoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      if (isCustomCalc) {
        mousePoint = {
          x: rect.width / 2,
          y: rect.height / 2,
        };
      }

      if (mousePoint.x < 0) {
        mousePoint.x = 0;
        if (mousePoint.y < 0) {
          mousePoint.y = 0;
        } else {
          if (mousePoint.y - rect.height > 0) {
            mousePoint.y = rect.height;
          }
        }
      }

      if (mousePoint.x - rect.width > 0) {
        mousePoint.x = rect.width;
        if (mousePoint.y < 0) {
          mousePoint.y = 0;
        } else {
          if (mousePoint.y - rect.height > 0) {
            mousePoint.y = rect.height;
          }
        }
      }

      if (mousePoint.y < 0) {
        mousePoint.y = 0;
        if (mousePoint.x < 0) {
          mousePoint.x = 0;
        } else {
          if (mousePoint.x - rect.width > 0) {
            mousePoint.x = rect.width;
          }
        }
      }

      if (mousePoint.y - rect.height > 0) {
        mousePoint.y = rect.height;
        if (mousePoint.x < 0) {
          mousePoint.x = 0;
        } else {
          if (mousePoint.x - rect.width > 0) {
            mousePoint.x = rect.width;
          }
        }
      }

      let ratioX = mousePoint.x / rect.width;
      let ratioY = mousePoint.y / rect.height;
      if (currentRatio < 0.1) {
        currentRatio = 0.1;
        ratioX = 0;
        ratioY = 0;
      }
      translateX -= result.width * preRatio * ratioX;
      translateY -= result.height * preRatio * ratioY;

      const resMinPosition = {
        x:
          (maxPosition.x ? maxPosition.x : translateX) -
          Math.abs(currentRatio - rangeLimit.minObj.ratio) * result.width,
        y:
          (maxPosition.y ? maxPosition.y : translateY) -
          Math.abs(currentRatio - rangeLimit.minObj.ratio) * result.height,
      };

      const resPosition = {
        x:
          translateX > maxPosition.x
            ? maxPosition.x
            : translateX <= resMinPosition.x
            ? resMinPosition.x
            : translateX,
        y:
          translateY > maxPosition.y
            ? maxPosition.y
            : translateY <= resMinPosition.y
            ? resMinPosition.y
            : translateY,
      };

      if (isSetInitPosition) {
        setPosition({
          x: translateX,
          y: translateY,
        });
        setIntiPosition({
          x: translateX,
          y: translateY,
        });
        setMaxPosition({
          x: translateX,
          y: translateY,
        });
      } else {
        setPosition(resPosition);
      }

      setMinPosition(resMinPosition);
      setScale(currentRatio);
      setValue(Number((+currentRatio * +step).toFixed(2)));
    };

    const throttledScalcImgFun = throttle(scalcImgFun, 200);

    const clickOutOfImg = () => {
      setTransformTime('0.3');
      if (value < rangeLimit.minObj.number) return;
      const res = Math.max(value - 25, rangeLimit.minObj.number);
      if (res === rangeLimit.minObj.number) {
        initImg();
        return;
      }

      const ratioNew = (res - value) / 50;
      scalcImgFun({
        initRatio: ratioNew,
        isCustomCalc: true,
        scale,
      });
    };

    const clickInOfImg = () => {
      setTransformTime('0.3');
      if (value > rangeLimit.maxObj.number) return;
      const res = Math.min(value + 25, rangeLimit.maxObj.number);

      if (scale === 2) return;
      const ratioNew = (res - value) / 50;

      scalcImgFun({
        initRatio: ratioNew,
        isCustomCalc: true,
        scale,
      });
    };

    const clickResetOfImg = () => {
      initImg();
    };

    const onChangeSlider = customValue => {
      const ratioNew = +((customValue - value) / 50).toFixed(2);
      throttledScalcImgFun({
        initRatio: ratioNew,
        isCustomCalc: true,
        scale,
      });
    };

    const renderResetIcon = ({ ...props }) => {
      const isInitSize = value !== rangeLimit.minObj.number;
      const ResetIcon = isInitSize ? ResetIconActive : ResetIconDisabled;
      return <ResetIcon {...props} />;
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseDownRange = () => {
      setIsHovered(false);
    };

    const handleMouseUpRange = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    return (
      <div>
        <HeaderCmp>
          <div className="handle-img-mes">
            <OverflowContainer>
              <div className="preview-name">
                {currentPreviewObj.name ? currentPreviewObj.name : ''}
              </div>
            </OverflowContainer>

            <span className="preview-size">{displayFileSize}</span>
          </div>
          <div className="handle-img-option">
            <InfoTooltip
              description={'Zoom out'}
              icon={
                <OutIcon onClick={clickOutOfImg} className="handle-icon-item" />
              }
            />
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseDown={handleMouseDownRange}
              onMouseUp={handleMouseUpRange}
            >
              <Slider
                className="slider-content"
                onChange={(e, value) => {
                  onChangeSlider(+e.target.value);
                }}
                max={rangeLimit.maxObj.number}
                min={rangeLimit.minObj.number}
                thumbVariant="pentagon"
                value={value}
                renderThumb={props => {
                  return (
                    <InfoTooltip
                      description={imgRatio}
                      tooltipProps={{
                        style: {
                          position: 'absolute',
                          left: props.progress,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '20px',
                        },
                        isOpen: isHovered,
                      }}
                      icon={
                        <RangeIcon
                          ref={rangeRef}
                          style={{
                            position: 'absolute',
                            left: props.progress,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '20px',
                            pointerEvents: 'none',
                            marginLeft: '-6px',
                          }}
                        />
                      }
                    />
                  );
                }}
              />
            </div>
            <InfoTooltip
              description={'Zoom in'}
              icon={
                <InIcon onClick={clickInOfImg} className="handle-icon-item" />
              }
            />

            <InfoTooltip
              description={'Reset'}
              icon={renderResetIcon({
                onClick: clickResetOfImg,
                className: `${value === rangeLimit.minObj.number &&
                  'disabled'} handle-icon-item`,
              })}
            />
          </div>
        </HeaderCmp>
        <div
          ref={containerRef}
          style={{
            width: '960px',
            height: containerHeight + 'px',
            overflow: 'hidden',
            position: 'relative',
            cursor:
              (+value).toFixed(2) > rangeLimit.minObj.number
                ? 'zoom-out'
                : 'zoom-in',
            // border: '1px solid black',

            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            ref={imgBoxRef}
            className="img-box"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) `,
              transformOrigin: '0 0',
              transition: `transform ${transformTime}s ease`,
              position: 'absolute',

              width: imgBoxStyle.width + 'px',
              height: imgBoxStyle.height + 'px',
              overflow: 'hidden',
            }}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Placeholder"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',

                display: 'block',
                objectFit: 'contain',

                font: 'initial',
              }}
              draggable={isDrag ? false : true}
            />
          </div>
        </div>

        <FooterCmp>
          <Button
            onClick={() => {
              onRequestClose();
            }}
            variant="primary"
          >
            {'Close'}
          </Button>
        </FooterCmp>
      </div>
    );
  }
);

export default ZoomableDraggableImage;
