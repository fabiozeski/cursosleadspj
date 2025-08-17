import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateLesson, useUploadFile, Lesson } from '@/hooks/useAdminCourses';
import { Loader2, Upload, X, FileText } from 'lucide-react';

const lessonSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  // coerce para garantir número mesmo se vier como string
  order_index: z.coerce.number().min(0),
  video_url: z.string().optional(),
  video_type: z.enum(['youtube', 'upload']).optional(),
  duration_minutes: z.coerce.number().min(0).optional(),
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface EditLessonModalProps {
  lesson: Lesson;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLessonModal({ lesson, open, onOpenChange }: EditLessonModalProps) {
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);
  const [uploadingMaterials, setUploadingMaterials] = useState(false);
  const updateLesson = useUpdateLesson();
  const uploadFile = useUploadFile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson.title,
      description: lesson.description || '',
      order_index: lesson.order_index,
      video_url: lesson.video_url || '',
      video_type: (lesson.video_type as 'youtube' | 'upload') || 'youtube',
      duration_minutes: lesson.duration_minutes,
    },
  });

  // 🔑 Sempre que trocar a aula (id), rehidratamos o form com os novos valores.
  useEffect(() => {
    reset({
      title: lesson.title,
      description: lesson.description || '',
      order_index: lesson.order_index,
      video_url: lesson.video_url || '',
      video_type: (lesson.video_type as 'youtube' | 'upload') || 'youtube',
      duration_minutes: lesson.duration_minutes,
    });
    setMaterialFiles([]); // opcional: limpa seleção de novos arquivos a cada troca de aula
  }, [lesson.id, reset]);

  const videoType = watch('video_type');

  const onSubmit = async (data: LessonFormData) => {
    try {
      setUploadingMaterials(true);
      
      // Upload new materials
      const newMaterials: any[] = [];
      for (const file of materialFiles) {
        const fileName = `${lesson.id}/${Date.now()}-${file.name}`;
        const uploadResult = await uploadFile.mutateAsync({
          file,
          bucket: 'course-materials',
          path: fileName,
        });
        
        newMaterials.push({
          name: file.name,
          url: uploadResult.publicUrl,
          type: file.type,
          size: file.size,
        });
      }

      // Merge with existing materials
      const existingMaterials = lesson.materials || [];
      const allMaterials = [...existingMaterials, ...newMaterials];

      await updateLesson.mutateAsync({
        id: lesson.id,
        title: data.title,
        description: data.description,
        order_index: data.order_index,
        video_url: data.video_url,
        video_type: data.video_type,
        duration_minutes: data.duration_minutes,
        materials: allMaterials,
      });

      onOpenChange(false);
      reset();
      setMaterialFiles([]);
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
    } finally {
      setUploadingMaterials(false);
    }
  };

  const handleMaterialFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMaterialFiles(prev => [...prev, ...files]);
  };

  const removeMaterialFile = (index: number) => {
    setMaterialFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMaterial = (index: number) => {
    const currentMaterials = lesson.materials || [];
    const updatedMaterials = currentMaterials.filter((_, i) => i !== index);
    // TODO: aqui você pode chamar updateLesson.mutateAsync({ id: lesson.id, materials: updatedMaterials })
    // se quiser remover imediatamente o material existente
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Aula</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register('title')}
              className="mt-1"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="order_index">Ordem</Label>
            <Input
              id="order_index"
              type="number"
              min="0"
              {...register('order_index', { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.order_index && (
              <p className="text-sm text-destructive mt-1">{errors.order_index.message as string}</p>
            )}
          </div>

          <div>
            <Label htmlFor="duration_minutes">Duração (minutos)</Label>
            <Input
              id="duration_minutes"
              type="number"
              min="0"
              {...register('duration_minutes', { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.duration_minutes && (
              <p className="text-sm text-destructive mt-1">{errors.duration_minutes.message as string}</p>
            )}
          </div>

          <div>
            <Label htmlFor="video_type">Tipo de Vídeo</Label>
            <Select
              value={videoType}
              onValueChange={(value: 'youtube' | 'upload') => setValue('video_type', value, { shouldValidate: true })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="upload">Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="video_url">
              {videoType === 'youtube' ? 'URL do YouTube' : 'URL do Vídeo'}
            </Label>
            <Input
              id="video_url"
              {...register('video_url')}
              placeholder={videoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'URL do vídeo uploaded'}
              className="mt-1"
            />
          </div>

          {/* Existing Materials */}
          {lesson.materials && lesson.materials.length > 0 && (
            <div>
              <Label>Materiais Existentes</Label>
              <div className="mt-2 space-y-2">
                {lesson.materials.map((material: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{material.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExistingMaterial(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Materials */}
          <div>
            <Label htmlFor="materials">Adicionar Novos Materiais</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="materials"
                type="file"
                multiple
                onChange={handleMaterialFilesChange}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            
            {materialFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                <Label className="text-sm">Novos arquivos selecionados:</Label>
                {materialFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMaterialFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || uploadingMaterials}>
              {(isSubmitting || uploadingMaterials) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
