'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/useProjectStore';

export default function DashboardPage() {
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects);
  const loadProject = useProjectStore((s) => s.loadProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const handleLoad = (id: string) => {
    loadProject(id);
    router.push('/studio');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteProject(id);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      px: 2,
      py: 3,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => router.push('/')} size="small" sx={{ color: 'text.secondary' }}>
          <ArrowBackRounded />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Your Beats</Typography>
      </Box>

      {projects.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 6,
        }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            No saved beats yet. Create one and save it to see it here!
          </Typography>
          <Button
            component={Link}
            href="/"
            variant="contained"
            sx={{ backgroundColor: '#FF1744' }}
          >
            Create a Beat
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {projects.map((project) => (
            <Box
              key={project.id}
              onClick={() => handleLoad(project.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 2,
                backgroundColor: '#141414',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  backgroundColor: '#1A1A1A',
                },
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {project.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                    {project.genre}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {project.bpm} BPM
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {new Date(project.savedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={(e) => handleDelete(e, project.id)}
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: '#FF1744' } }}
              >
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
