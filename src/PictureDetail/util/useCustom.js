import React, { useState, useMemo, useEffect, useRef } from 'react';

const useCacheImg = ({ previewObj }) => {
  const [currentIndex, setCurrentIndex] = useState(previewObj.current);
  const [loading, setLoading] = useState(false);
  const [imageCache, setImageCache] = useState({});
  const [transformTime, setTransformTime] = useState('0');

  const [visible, setVisible] = useState(false);

  const [scale, setScale] = useState(1);

  const detailPictureRef = useRef();

  const setTransformTimeFun = number => {
    setTransformTime(number);
  };

  const toggleNext = e => {
    e.stopPropagation();
    setTransformTimeFun(0);
    console.log(detailPictureRef);
    if (detailPictureRef.current) {
      detailPictureRef.current?.someFunction();
    }
    setCurrentIndex(currentIndex + 1);
  };
  const togglePrev = e => {
    e.stopPropagation();
    setTransformTimeFun(0);
    console.log(detailPictureRef);
    if (detailPictureRef.current) {
      detailPictureRef.current?.someFunction();
    }
    setCurrentIndex(currentIndex - 1);
  };

  useEffect(() => {
    setCurrentIndex(previewObj.current);
  }, [previewObj]);

  const currentPreviewObj = useMemo(() => {
    if (!!previewObj.previewList) {
      return previewObj.previewList[currentIndex] || {};
    } else {
      return {};
    }
  }, [previewObj, currentIndex]);

  useEffect(() => {
    setLoading(true);

    if (imageCache[currentPreviewObj?.url]) {
      setLoading(false);
    } else {
      const img = new Image();
      img.src = currentPreviewObj?.url;
      img.onload = () => {
        setLoading(false);
        setImageCache(prevCache => ({
          ...prevCache,
          [currentPreviewObj?.url]: true,
        }));
      };
    }
  }, [currentIndex, currentPreviewObj]);

  return {
    loading,
    currentPreviewObj,
    toggleNext,
    togglePrev,
    currentIndex,
    transformTime,
    setTransformTime: setTransformTimeFun,
    detailPictureRef,
  };
};

export { useCacheImg };
