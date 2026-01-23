# File Upload with Progress Tracking

Production patterns for handling file uploads in forms with validation, progress indicators, and error handling.

## Pattern 1: Basic File Upload with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const schema = z.object({
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: 'File must be less than 5MB'
    })
    .refine((file) => ACCEPTED_TYPES.includes(file.type), {
      message: 'Only JPEG, PNG, and WebP images allowed'
    })
});

function FileUploadForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: { avatar: File }) => {
    const formData = new FormData();
    formData.append('avatar', data.avatar);

    await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="avatar">Profile Picture</label>
      <input
        id="avatar"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        {...register('avatar', {
          // Convert FileList to File
          setValueAs: (files: FileList) => files[0]
        })}
      />
      {errors.avatar && (
        <span className="error">{errors.avatar.message}</span>
      )}

      <button type="submit">Upload</button>
    </form>
  );
}
```

---

## Pattern 2: Preview Before Upload

Show image preview before submitting.

```typescript
function ImageUploadWithPreview() {
  const [preview, setPreview] = useState<string | null>(null);
  const { register, watch } = useForm();

  const file = watch('image')?.[0];

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Cleanup
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        {...register('image')}
      />

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" style={{ maxWidth: 300 }} />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setValue('image', null);
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Pattern 3: Upload Progress with XMLHttpRequest

Track upload progress for large files.

```typescript
function UploadWithProgress() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        setUploading(false);
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        setUploading(false);
        reject(new Error('Network error'));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
        disabled={uploading}
      />

      {uploading && (
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}
```

---

## Pattern 4: Multiple File Upload

Handle multiple files with individual progress tracking.

```typescript
interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

function MultiFileUpload() {
  const [uploads, setUploads] = useState<FileUpload[]>([]);

  const handleFileSelect = (files: FileList) => {
    const newUploads = Array.from(files).map((file) => ({
      id: Math.random().toString(36),
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Start uploading
    newUploads.forEach((upload) => uploadFile(upload));
  };

  const uploadFile = async (upload: FileUpload) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === upload.id ? { ...u, status: 'uploading' } : u
      )
    );

    const formData = new FormData();
    formData.append('file', upload.file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id ? { ...u, progress } : u
            )
          );
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) resolve(xhr.response);
          else reject(new Error('Upload failed'));
        });
        xhr.addEventListener('error', reject);
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id ? { ...u, status: 'complete', progress: 100 } : u
        )
      );
    } catch (error) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: 'error', error: error.message }
            : u
        )
      );
    }
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files) handleFileSelect(e.target.files);
        }}
      />

      <div className="upload-list">
        {uploads.map((upload) => (
          <div key={upload.id} className="upload-item">
            <span>{upload.file.name}</span>

            {upload.status === 'uploading' && (
              <div className="progress">
                <div style={{ width: `${upload.progress}%` }} />
              </div>
            )}

            {upload.status === 'complete' && (
              <span className="success">✓ Uploaded</span>
            )}

            {upload.status === 'error' && (
              <span className="error">{upload.error}</span>
            )}

            <button onClick={() => removeUpload(upload.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Pattern 5: Drag and Drop

Enhance UX with drag-and-drop support.

```typescript
function DragDropUpload() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      // Validate and upload
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is too large`);
        return;
      }
      uploadFile(file);
    });
  };

  return (
    <div
      className={`dropzone ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files));
        }}
        style={{ display: 'none' }}
        id="file-input"
      />

      <label htmlFor="file-input" className="drop-label">
        {isDragging ? (
          <>Drop files here</>
        ) : (
          <>
            Drag & drop files here, or <span className="link">browse</span>
          </>
        )}
      </label>
    </div>
  );
}
```

**Styles**:
```css
.dropzone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.dropzone.dragging {
  border-color: #4CAF50;
  background: #f0f9f0;
}

.dropzone .link {
  color: #2196F3;
  text-decoration: underline;
}
```

---

## Pattern 6: Chunked Upload (Large Files)

Split large files into chunks for reliable uploads.

```typescript
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

async function uploadFileInChunks(file: File) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = Math.random().toString(36);

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', file.name);

    await fetch('/api/upload-chunk', {
      method: 'POST',
      body: formData
    });

    // Update progress
    const progress = ((chunkIndex + 1) / totalChunks) * 100;
    console.log(`Upload progress: ${progress}%`);
  }

  // Finalize upload (merge chunks on server)
  await fetch('/api/finalize-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId, fileName: file.name })
  });
}
```

**Server-side (Node.js example)**:
```typescript
// Receive chunk
app.post('/api/upload-chunk', async (req, res) => {
  const { uploadId, chunkIndex, totalChunks, fileName } = req.body;
  const chunk = req.files.chunk;

  const chunkDir = path.join('/tmp/uploads', uploadId);
  await fs.mkdir(chunkDir, { recursive: true });

  const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);
  await chunk.mv(chunkPath);

  res.json({ success: true });
});

// Merge chunks
app.post('/api/finalize-upload', async (req, res) => {
  const { uploadId, fileName } = req.body;
  const chunkDir = path.join('/tmp/uploads', uploadId);

  const finalPath = path.join('/uploads', fileName);
  const writeStream = fs.createWriteStream(finalPath);

  const chunkFiles = await fs.readdir(chunkDir);
  chunkFiles.sort((a, b) => {
    const aIndex = parseInt(a.split('-')[1]);
    const bIndex = parseInt(b.split('-')[1]);
    return aIndex - bIndex;
  });

  for (const chunkFile of chunkFiles) {
    const chunkPath = path.join(chunkDir, chunkFile);
    const data = await fs.readFile(chunkPath);
    writeStream.write(data);
  }

  writeStream.end();
  await fs.rm(chunkDir, { recursive: true });

  res.json({ success: true, url: `/uploads/${fileName}` });
});
```

---

## Pattern 7: Image Compression Before Upload

Reduce file size client-side before uploading.

```typescript
async function compressImage(file: File, maxWidth = 1920): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    img.onload = () => {
      const scaleFactor = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        },
        'image/jpeg',
        0.9 // Quality (0-1)
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Usage
async function handleImageUpload(file: File) {
  if (file.size > 2 * 1024 * 1024) {
    // Compress if > 2MB
    const compressed = await compressImage(file);
    uploadFile(compressed);
  } else {
    uploadFile(file);
  }
}
```

---

## Production Checklist

```
□ File size validation (client + server)
□ File type validation (MIME type check)
□ Progress indicator for uploads &gt;1MB
□ Error handling with retry capability
□ Cancel upload functionality
□ Image compression for large files
□ Chunked upload for files &gt;10MB
□ Drag-and-drop support
□ Preview for image uploads
□ Accessible file input labels
□ Security: virus scanning on server
□ Security: filename sanitization
□ Security: storage quota enforcement
□ HTTPS required for uploads
```

---

## Security Considerations

1. **Validate MIME type on server**: Don't trust client-side checks
2. **Rename files**: Avoid executing uploaded scripts
3. **Store outside web root**: Prevent direct access
4. **Virus scanning**: Use ClamAV or similar
5. **Rate limiting**: Prevent abuse
6. **Authentication**: Require login for uploads

```typescript
// Server-side validation (Node.js)
import fileType from 'file-type';

app.post('/upload', async (req, res) => {
  const file = req.files.upload;

  // Validate actual file type
  const type = await fileType.fromBuffer(file.data);
  if (!['image/jpeg', 'image/png'].includes(type.mime)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  // Generate safe filename
  const ext = type.ext;
  const safeName = `${Date.now()}-${Math.random().toString(36)}.${ext}`;

  // Store outside public directory
  await file.mv(`/var/uploads/${safeName}`);

  res.json({ url: `/files/${safeName}` });
});
```

---

## Resources

- [MDN: File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [react-dropzone](https://react-dropzone.js.org/) - Popular drag-and-drop library
- [Uppy](https://uppy.io/) - Full-featured upload library
