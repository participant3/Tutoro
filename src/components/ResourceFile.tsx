type ResourceFileProps = {
    fileName: string
    fileType: string
    fileSize: number
    onOpen?: () => void
    onRemove?: () => void
  }
  
  function ResourceFile({
    fileName,
    fileType,
    fileSize,
    onOpen,
    onRemove,
  }: ResourceFileProps) {
    function formatFileSize(bytes: number) {
      if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(0)} KB`
      }
  
      return `${(
        bytes /
        1024 /
        1024
      ).toFixed(2)} MB`
    }
  
    const fileLabel =
      fileType === 'application/pdf'
        ? 'PDF'
        : 'Image'
  
    return (
      <div className="resource-file">
  
        <div className="resource-file-icon">
          {fileType === 'application/pdf'
            ? 'PDF'
            : 'IMG'}
        </div>
  
  
        <div className="resource-file-info">
  
          <strong>
            {fileName}
          </strong>
  
          <span>
            {fileLabel}
            {' · '}
            {formatFileSize(fileSize)}
          </span>
  
        </div>
  
  
        <div className="resource-file-actions">
  
          {onOpen && (
            <button
              type="button"
              className="resource-action-button"
              onClick={onOpen}
            >
              Open
            </button>
          )}
  
  
          {onRemove && (
            <button
              type="button"
              className="resource-remove-button"
              onClick={onRemove}
            >
              Remove
            </button>
          )}
  
        </div>
  
      </div>
    )
  }
  
  export default ResourceFile