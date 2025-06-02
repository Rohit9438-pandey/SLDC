import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  Paper,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Print as FaxIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  maxHeight: '80vh',
  overflowY: 'auto',
  bgcolor: 'white',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
};

const Container = styled(Box)({
  overflowX: 'auto',
  padding: '16px',
  minHeight: '100vh',
  background: '#f8f9fb',
});

const TreeContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  minWidth: 'fit-content',
});

const LineVertical = styled(Box)({
  width: 2,
  height: 20,
  backgroundColor: '#ccc',
  margin: '0 auto',
});

const LineHorizontal = styled(Box)({
  height: 2,
  backgroundColor: '#ccc',
  position: 'absolute',
  top: 0,
  left: 0,
  transform: 'translateY(-50%)',
});

const NodeBox = styled(Box)(({ bg }) => ({
  padding: 16,
  borderRadius: 12,
  background: bg,
  color: 'white',
  cursor: 'pointer',
  minWidth: 220,
  textAlign: 'center',
  marginBottom: 8,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const getRandomColor = (isChild = false) => {
  const palette = isChild
    ? ['#81c784', '#64b5f6', '#ffb74d', '#ba68c8', '#4db6ac']
    : ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00acc1'];
  return palette[Math.floor(Math.random() * palette.length)];
};

const buildTree = (data, parent = null) => {
  // Find children who have this parent
  const children = data.filter(item => item.USER_UNDER === parent);

  // For each child, check if it itself has children (managers)
  return children
    .filter(child => {
      // check if child has subordinates
      const hasSubordinates = data.some(item => item.USER_UNDER === child.DESIGNATION);
      // Only include if child is a manager (has children)
      return hasSubordinates;
    })
    .map(child => ({
      ...child,
      children: buildTree(data, child.DESIGNATION),
    }));
};


const OrganisationChart = () => {
  const [treeData, setTreeData] = useState([]);
  const [flatData, setFlatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        'https://delhisldc.org/app-api/get-data?table=DTL_DIRECTORY'
      );
      const json = await res.json();
      const keys = json.result.metaData.map((col) => col.name);
      const rows = json.result.rows.map((row) =>
        Object.fromEntries(keys.map((key, i) => [key, row[i]]))
      );
      setFlatData(rows);
      setTreeData(buildTree(rows));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (node) => {
    setSelectedNode(node);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedNode(null);
    setOpen(false);
  };

 const renderModal = () => {
  if (!selectedNode) return null;

  // All immediate subordinates (both managers and team members)
  const children = flatData.filter(
    (item) =>
      item.USER_UNDER?.trim().toLowerCase() === selectedNode.DESIGNATION?.trim().toLowerCase()
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {selectedNode.DESIGNATION}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box mb={2}>
          <Typography fontWeight="bold" sx={{ color: '#0d47a1' }}>
            {selectedNode.NAME}
          </Typography>
          {selectedNode.ADDRESS && (
            <Typography sx={{ display: 'flex', alignItems: 'center', mt: 1, color: '#388e3c' }}>
              <HomeIcon sx={{ mr: 1 }} />
              {selectedNode.ADDRESS}
            </Typography>
          )}
          {selectedNode.PHONE && (
            <Typography sx={{ display: 'flex', alignItems: 'center', color: '#1976d2' }}>
              <PhoneIcon sx={{ mr: 1 }} />
              {selectedNode.PHONE}
            </Typography>
          )}
          {selectedNode.EMAIL && (
            <Typography sx={{ display: 'flex', alignItems: 'center', color: '#f57c00' }}>
              <EmailIcon sx={{ mr: 1 }} />
              {selectedNode.EMAIL}
            </Typography>
          )}
          {selectedNode.FAX && (
            <Typography sx={{ display: 'flex', alignItems: 'center', color: '#7b1fa2' }}>
              <FaxIcon sx={{ mr: 1 }} />
              {selectedNode.FAX}
            </Typography>
          )}
        </Box>

        {children.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', color: '#455a64' }}>
              <PeopleIcon sx={{ mr: 1 }} />
              Team Members:
            </Typography>
            {children.map((child) => (
              <Paper
                key={child.DESIGNATION}
                sx={{
                  p: 2,
                  mt: 1,
                  backgroundColor: '#e3f2fd',
                  borderLeft: '6px solid #2196f3',
                }}
              >
                <Typography fontWeight="bold" sx={{ color: '#1565c0' }}>
                  {child.DESIGNATION}
                </Typography>
                <Typography>{child.NAME}</Typography>
              </Paper>
            ))}
          </>
        )}
      </Box>
    </Modal>
  );
};


 const TreeNode = ({ node, isChild = false }) => {
  const hasChildren = node.children && node.children.length > 0;
  const nodeColor = getRandomColor(isChild);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <NodeBox bg={nodeColor} onClick={() => handleOpen(node)}>
        <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'white', color: nodeColor }}>
          {node.NAME?.[0] || '?'}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold">
          {node.DESIGNATION}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {node.NAME}
        </Typography>
      </NodeBox>

      {hasChildren && (
        <>
          <LineVertical />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              mt: 2,
            }}
          >
            <LineHorizontal sx={{ width: `${node.children.length * 240 - 16}px` }} />
            {node.children.map((child, idx) => (
              <Box key={idx} sx={{ mx: 2 }}>
                <TreeNode node={child} isChild />
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h4" fontWeight="bold" align="center" mb={4}>
        DTL Organizational Hierarchy
      </Typography>
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <TreeContainer>
          {treeData.map((root, idx) => (
            <TreeNode key={idx} node={root} />
          ))}
        </TreeContainer>
      </Box>
      {renderModal()}
    </Container>
  );
};

export default OrganisationChart;
