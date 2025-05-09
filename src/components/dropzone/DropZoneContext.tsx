import React, { createContext, useContext, useState, useCallback, useEffect, PropsWithChildren, useRef } from 'react';

interface DropZoneContextType {
  isDragActive: boolean;
  setIsDragActive: (isDragActive: boolean) => void;
  onUpload: (files: File[]) => void;
  fileType: string | null;
  fileCount: number;
  isValidFileType: boolean;
  isOverDropZone: boolean;
}

const DropZoneContext = createContext<DropZoneContextType | undefined>(undefined);

export const useDropZone = () => {
  const context = useContext(DropZoneContext);
  if (!context) {
    throw new Error('useDropZone must be used within a DropZoneProvider');
  }
  return context;
};

interface DropZoneProviderProps {
  onUpload: (files: File[]) => void;
  allowList?: string[];
  blockList?: string[];
  [key: string]: any;
}

const preventDefault = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const defaultBlockList = ['text/plain', 'application/x-msdownload'];

const getFileTypeValidation = (files: DataTransferItemList | FileList, allowList?: string[], blockList?: string[]) => {
  const effectiveBlockList = blockList || defaultBlockList;
  const fileArray = Array.from(files as FileList);
  let commonFileType = fileArray[0].type;
  for (const file of fileArray) {
    const fileType = file.type;
    if (allowList && !allowList.includes(fileType)) {
      return { isValid: false, commonFileType: 'various' };
    }
    if (effectiveBlockList.includes(fileType)) {
      return { isValid: false, commonFileType: 'various' };
    }
    if (fileType !== commonFileType) {
      commonFileType = 'various';
    }
  }
  return { isValid: true, commonFileType };
};

export const DropZoneProvider: React.FC<PropsWithChildren<DropZoneProviderProps>> = ({
  onUpload,
  allowList,
  blockList,
  children,
}) => {
  if (allowList && blockList) {
    throw new Error('You can use either allowList or blockList, but not both.');
  }

  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [isOverDropZone, setIsOverDropZone] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState<number>(0);
  const [isValidFileType, setIsValidFileType] = useState<boolean>(true);
  const dragCounter = useRef(0);

  const handleDragIn = useCallback(
    (e: DragEvent) => {
      preventDefault(e);
      dragCounter.current++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        const { isValid, commonFileType } = getFileTypeValidation(e.dataTransfer.items, allowList, blockList);
        setIsValidFileType(isValid);
        if (isValid) {
          setFileType(commonFileType);
          setFileCount(e.dataTransfer.items.length);
          setIsDragActive(true);
        } else {
          setIsDragActive(false);
        }
      }
    },
    [allowList, blockList],
  );

  const handleDragOut = useCallback((e: DragEvent) => {
    preventDefault(e);
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragActive(false);
      setFileType(null);
      setFileCount(0);
      setIsValidFileType(true);
    }

    if ((e.target as HTMLElement).tagName === 'HTML') {
      dragCounter.current = 0;
      setIsDragActive(false);
      setFileType(null);
      setFileCount(0);
      setIsValidFileType(true);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      preventDefault(e);
      dragCounter.current = 0;
      setIsDragActive(false);
      setIsOverDropZone(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const { isValid, commonFileType } = getFileTypeValidation(e.dataTransfer.files, allowList, blockList);
        setIsValidFileType(isValid);
        if (isValid) {
          setFileType(commonFileType);
          setFileCount(e.dataTransfer.files.length);
          onUpload(Array.from(e.dataTransfer.files));
        } else {
          setFileType('various');
          setFileCount(e.dataTransfer.files.length);
        }
        e.dataTransfer.clearData();
      }
    },
    [onUpload, allowList, blockList],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    preventDefault(e);
    if ((e.target as HTMLElement).getAttribute('data-type') === 'active-dropzone') {
      setIsOverDropZone(true);
    } else {
      setIsOverDropZone(false);
    }
  }, []);

  useEffect(() => {
    const addListener = document.body.addEventListener;
    addListener('dragenter', handleDragIn);
    addListener('dragleave', handleDragOut);
    addListener('dragover', handleDragOver);
    addListener('drop', handleDrop);

    return () => {
      const removeListener = document.body.removeEventListener;
      removeListener('dragenter', handleDragIn);
      removeListener('dragleave', handleDragOut);
      removeListener('dragover', handleDragOver);
      removeListener('drop', handleDrop);
    };
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  return (
    <DropZoneContext.Provider
      value={{ isDragActive, setIsDragActive, onUpload, fileType, fileCount, isValidFileType, isOverDropZone }}
    >
      {children}
    </DropZoneContext.Provider>
  );
};
