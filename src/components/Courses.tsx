'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  useTheme,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';

interface Resource {
  type: 'pdf' | 'ppt' | 'pptx' | 'docx' | 'image' | 'video';
  title: string;
  url: string;
}

interface WeeklyContent {
  week: number;
  title: string;
  description: string;
  resources: Resource[];
}

interface Course {
  _id?: string;
  title: string;
  description: string;
  semester: 'Güz' | 'Bahar' | 'Yaz';
  year: number;
  department: string;
  code: string;
  ects: number;
  type: 'Zorunlu' | 'Seçmeli';
  weeklyContents: WeeklyContent[];
}

export default function Courses() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [weekTitle, setWeekTitle] = useState('');
  const [weekDescription, setWeekDescription] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Dersler yüklenirken hata oluştu');
      }
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!editingCourse) return;

    try {
      const method = editingCourse._id ? 'PUT' : 'POST';
      const url = editingCourse._id 
        ? `/api/courses/${editingCourse._id}` 
        : '/api/courses';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCourse)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ders kaydedilirken hata oluştu');
      }

      await fetchCourses();
      setDialogOpen(false);
      setEditingCourse(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Beklenmeyen bir hata oluştu');
      }
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ders silinirken hata oluştu');
      }

      await fetchCourses();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Beklenmeyen bir hata oluştu');
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, courseId: string) => {
    if (!event.target.files || !event.target.files[0]) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingFile(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Dosya yüklenirken hata oluştu');
      }

      const { url, type } = await response.json();

      // Dosyayı haftalık içeriğe ekle
      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      const weekContent = course.weeklyContents.find(w => w.week === selectedWeek);
      if (!weekContent) {
        course.weeklyContents.push({
          week: selectedWeek,
          title: weekTitle,
          description: weekDescription,
          resources: [{
            type,
            title: file.name,
            url
          }]
        });
      } else {
        weekContent.resources.push({
          type,
          title: file.name,
          url
        });
      }

      // Kursu güncelle
      const updateResponse = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });

      if (!updateResponse.ok) {
        throw new Error('Kurs güncellenirken hata oluştu');
      }

      await fetchCourses();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setUploadingFile(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'ppt':
      case 'pptx':
      case 'docx':
        return <DescriptionIcon />;
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 500 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dersler
      </Typography>

      {session?.user?.isAdmin && (
        <Button 
          startIcon={<AddIcon />} 
          variant="contained" 
          sx={{ mb: 2 }}
          onClick={() => {
            setEditingCourse({
              title: '',
              description: '',
              semester: 'Güz',
              year: new Date().getFullYear(),
              department: '',
              code: '',
              ects: 3,
              type: 'Zorunlu',
              weeklyContents: []
            });
            setDialogOpen(true);
          }}
        >
          Yeni Ders Ekle
        </Button>
      )}

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {course.code} - {course.title}
                  </Typography>
                  {session?.user?.isAdmin && (
                    <Box>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingCourse(course);
                          setDialogOpen(true);
                        }}
                        startIcon={<EditIcon />}
                      >
                        Düzenle
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteCourse(course._id!)}
                        startIcon={<DeleteIcon />}
                      >
                        Sil
                      </Button>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {course.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip 
                    label={`${course.semester} ${course.year}`} 
                    size="small" 
                    color="primary" 
                  />
                  <Chip 
                    label={course.type} 
                    size="small" 
                    color={course.type === 'Zorunlu' ? 'error' : 'success'} 
                  />
                </Box>
                <Typography variant="body2">
                  Bölüm: {course.department}
                </Typography>
                <Typography variant="body2">
                  ECTS: {course.ects}
                </Typography>

                {/* Haftalık İçerikler */}
                {course.weeklyContents.map((content) => (
                  <Accordion key={content.week}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Hafta {content.week}: {content.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph>
                        {content.description}
                      </Typography>
                      <List>
                        {content.resources.map((resource, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={resource.title}
                              secondary={
                                <Button
                                  href={resource.url}
                                  target="_blank"
                                  startIcon={getResourceIcon(resource.type)}
                                  size="small"
                                >
                                  Görüntüle
                                </Button>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}

                {session?.user?.isAdmin && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingCourse(course);
                        setContentDialogOpen(true);
                      }}
                      fullWidth
                    >
                      Haftalık İçerik Ekle
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ders Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => {
          setDialogOpen(false);
          setEditingCourse(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCourse?._id ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ders Başlığı"
            fullWidth
            value={editingCourse?.title || ''}
            onChange={(e) => setEditingCourse(prev => prev ? { ...prev, title: e.target.value } : null)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            fullWidth
            multiline
            rows={3}
            value={editingCourse?.description || ''}
            onChange={(e) => setEditingCourse(prev => prev ? { ...prev, description: e.target.value } : null)}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Dönem</InputLabel>
                <Select
                  value={editingCourse?.semester || 'Güz'}
                  label="Dönem"
                  onChange={(e) => setEditingCourse(prev => prev ? { ...prev, semester: e.target.value as 'Güz' | 'Bahar' | 'Yaz' } : null)}
                >
                  <MenuItem value="Güz">Güz</MenuItem>
                  <MenuItem value="Bahar">Bahar</MenuItem>
                  <MenuItem value="Yaz">Yaz</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Yıl"
                type="number"
                fullWidth
                value={editingCourse?.year || new Date().getFullYear()}
                onChange={(e) => setEditingCourse(prev => prev ? { ...prev, year: Number(e.target.value) } : null)}
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="Bölüm"
            fullWidth
            value={editingCourse?.department || ''}
            onChange={(e) => setEditingCourse(prev => prev ? { ...prev, department: e.target.value } : null)}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Ders Kodu"
                fullWidth
                value={editingCourse?.code || ''}
                onChange={(e) => setEditingCourse(prev => prev ? { ...prev, code: e.target.value } : null)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="ECTS"
                type="number"
                fullWidth
                value={editingCourse?.ects || 3}
                onChange={(e) => setEditingCourse(prev => prev ? { ...prev, ects: Number(e.target.value) } : null)}
              />
            </Grid>
          </Grid>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Ders Türü</InputLabel>
            <Select
              value={editingCourse?.type || 'Zorunlu'}
              label="Ders Türü"
              onChange={(e) => setEditingCourse(prev => prev ? { ...prev, type: e.target.value as 'Zorunlu' | 'Seçmeli' } : null)}
            >
              <MenuItem value="Zorunlu">Zorunlu</MenuItem>
              <MenuItem value="Seçmeli">Seçmeli</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setEditingCourse(null);
          }}>
            İptal
          </Button>
          <Button onClick={handleAddCourse} variant="contained">
            {editingCourse?._id ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Haftalık İçerik Ekleme Dialog */}
      <Dialog
        open={contentDialogOpen}
        onClose={() => {
          setContentDialogOpen(false);
          setSelectedWeek(1);
          setWeekTitle('');
          setWeekDescription('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Haftalık İçerik Ekle</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Hafta</InputLabel>
            <Select
              value={selectedWeek}
              label="Hafta"
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
            >
              {Array.from({ length: 16 }, (_, i) => i + 1).map((week) => (
                <MenuItem key={week} value={week}>Hafta {week}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Başlık"
            fullWidth
            value={weekTitle}
            onChange={(e) => setWeekTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            fullWidth
            multiline
            rows={3}
            value={weekDescription}
            onChange={(e) => setWeekDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box>
            <input
              accept=".pdf,.ppt,.pptx,.docx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.ogg"
              style={{ display: 'none' }}
              id="resource-file"
              type="file"
              onChange={(e) => editingCourse?._id && handleFileUpload(e, editingCourse._id)}
            />
            <label htmlFor="resource-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                disabled={uploadingFile}
                fullWidth
              >
                {uploadingFile ? 'Yükleniyor...' : 'Kaynak Yükle'}
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setContentDialogOpen(false);
            setSelectedWeek(1);
            setWeekTitle('');
            setWeekDescription('');
          }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
