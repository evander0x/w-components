import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
// cmp
import { LineLoader } from '@ubnt/ui-components';
import DetailPicture from './dragCmp';
import { useCacheImg } from './util/useCustom';

import { ReactComponent as ArrowLeftIcon } from '../assets/svg/common/arrow-left.svg';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/common/arrow-right.svg';

const PreviewContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  .toggle-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(126, 129, 144, 0.26);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    cursor: pointer;

    > svg {
      color: white;
      height: 40px !important;
    }
    &:hover {
      > svg {
        color: #f9fafa;
      }
    }
  }
`;

const Content = styled.img`
  width: auto;
  height: auto;
  max-height: 550px;
  max-width: 882px;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 649px;

  :hover {
    .approval-img-switch-container {
      display: flex;
    }
  }

  .approval-img-switch-container {
    display: none;
    position: absolute;
    width: 100%;
    top: calc(50% + 26px);
    left: 50%;
    /* height: 50px; */
    transform: translate(-50%, -50%);
  }
`;

const Preview = ({
  previewObj = {},
  // g-props
  onRequestClose,
}) => {
  const {
    loading,
    currentPreviewObj,
    toggleNext,
    togglePrev,
    currentIndex,
    transformTime,
    setTransformTime,
    detailPictureRef,
  } = useCacheImg({
    previewObj,
  });

  return (
    <Container>
      <LineLoader isLoading={loading}></LineLoader>
      <DetailPicture
        ref={detailPictureRef}
        src={currentPreviewObj.url}
        onRequestClose={onRequestClose}
        currentPreviewObj={currentPreviewObj}
        transformTime={transformTime}
        setTransformTime={setTransformTime}
      />

      <PreviewContainer className="approval-img-switch-container">
        {!!previewObj.previewList && currentIndex > 0 && (
          <div
            className="toggle-button"
            style={{ left: '16px' }}
            onClick={togglePrev}
          >
            <ArrowLeftIcon />
          </div>
        )}
        {!!previewObj.previewList &&
          currentIndex < previewObj.previewList.length - 1 && (
            <div
              className="toggle-button"
              style={{ right: '16px' }}
              onClick={toggleNext}
            >
              <ArrowRightIcon />
            </div>
          )}
      </PreviewContainer>
    </Container>
  );
};

Preview.propTypes = {
  previewObj: PropTypes.object,
  onRequestClose: PropTypes.func,
};

export default Preview;
