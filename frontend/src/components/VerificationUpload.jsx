import React, { useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Badge,
  Flex
} from '@chakra-ui/react';
import { UploadCloud, FileText, Image, AlertCircle } from 'lucide-react';

// Detect file category from MIME type
const getFileCategory = (file) => {
  if (!file) return null;
  if (file.type === 'application/pdf') return 'PDF';
  if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) return 'IMAGE';
  return 'UNSUPPORTED';
};

const FILE_META = {
  PDF: {
    label: 'PDF Document',
    badge: 'PDF',
    badgeColor: 'blue',
    method: 'SHA-256 + OCR Verification',
    icon: FileText,
    iconColor: '#60a5fa',
    stages: [
      'Extracting semantic PDF content...',
      'Normalizing content...',
      'Generating SHA-256 hash...',
      'Running OCR extraction...',
      'Extracting structured fields...'
    ]
  },
  IMAGE: {
    label: 'Scanned Image',
    badge: 'IMAGE',
    badgeColor: 'purple',
    method: 'pHash + OCR Verification',
    icon: Image,
    iconColor: '#c084fc',
    stages: [
      'Preprocessing image...',
      'Generating perceptual hash...',
      'Running OCR extraction...',
      'Extracting structured fields...'
    ]
  }
};

const VerificationUpload = ({ 
  onFileSelect, 
  selectedFile, 
  loading, 
  progress, 
  result, 
  error,
  hashAlgorithm
}) => {
  const fileInputRef = useRef(null);

  // Determine accepted file types based on hashAlgorithm from stored document
  const isImageDoc = hashAlgorithm === 'pHash';
  const acceptedTypes = isImageDoc ? '.jpg,.jpeg,.png' : '.pdf,.jpg,.jpeg,.png';

  // Determine the category of the currently selected file
  const fileCategory = getFileCategory(selectedFile);
  const fileMeta = fileCategory ? FILE_META[fileCategory] : null;

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    if (loading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (loading) return;
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    onFileSelect(null);
  };

  return (
    <Box
      p={8}
      bg="rgba(255,255,255,0.03)"
      borderWidth={1}
      borderColor={fileCategory === 'IMAGE' ? 'purple.500' : fileCategory === 'PDF' ? 'blue.500' : 'whiteAlpha.100'}
      borderRadius="2xl"
      h="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      position="relative"
      transition="all 0.3s"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }}
        accept={acceptedTypes}
        disabled={loading}
      />

      <VStack gap={6} align="center" textAlign="center">
        {loading ? (
          // ─── Loading State ────────────────────────────────────────────────
          <VStack gap={4}>
            <Box p={6} borderRadius="full" bg="rgba(0,0,0,0.3)" borderWidth={1} borderColor="whiteAlpha.200">
              <Spinner size="xl" color={fileMeta?.iconColor || 'green.400'} thickness="3px" />
            </Box>
            <Box>
              <Text fontWeight="bold" color="white" fontSize="md">
                {progress?.stage || 'Processing document...'}
              </Text>
              <Text fontSize="sm" color="whiteAlpha.500" mt={1}>
                {progress?.percent || 0}% Complete
              </Text>
            </Box>
            <Box w="100%" h="4px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" mt={2} maxW="240px">
              <Box
                h="100%"
                bg={fileCategory === 'IMAGE' ? 'purple.400' : 'blue.400'}
                w={`${progress?.percent || 0}%`}
                transition="width 0.3s"
              />
            </Box>
            {fileMeta && (
              <Badge colorPalette={fileMeta.badgeColor} variant="surface" px={3} py={1} borderRadius="full">
                {fileMeta.method}
              </Badge>
            )}
          </VStack>
        ) : selectedFile && fileCategory === 'UNSUPPORTED' ? (
          // ─── Unsupported File Warning ─────────────────────────────────────
          <VStack gap={4}>
            <Box p={6} borderRadius="full" bg="rgba(245, 101, 101, 0.1)" borderWidth={1} borderColor="red.500">
              <AlertCircle size={48} color="#f87171" />
            </Box>
            <Box>
              <Text fontWeight="bold" color="red.400" fontSize="lg">Unsupported File Type</Text>
              <Text fontSize="sm" color="whiteAlpha.600" mt={1}>{selectedFile.name}</Text>
              <Text fontSize="xs" color="whiteAlpha.500" mt={2}>Only PDF, JPG, JPEG, and PNG files are supported.</Text>
            </Box>
            <Button mt={2} variant="outline" color="red.400" borderColor="red.500" onClick={handleClear} size="sm" borderRadius="full">
              Clear & Choose Again
            </Button>
          </VStack>
        ) : selectedFile && fileMeta ? (
          // ─── File Selected State ───────────────────────────────────────────
          <VStack gap={4}>
            <Box
              p={6}
              borderRadius="full"
              bg={fileCategory === 'IMAGE' ? 'rgba(192, 132, 252, 0.1)' : 'rgba(96, 165, 250, 0.1)'}
              borderWidth={1}
              borderColor={fileCategory === 'IMAGE' ? 'purple.500' : 'blue.500'}
            >
              <fileMeta.icon size={48} color={fileMeta.iconColor} />
            </Box>
            <Box>
              <Text fontWeight="bold" color="white" fontSize="lg">{selectedFile.name}</Text>
              <Text fontSize="sm" color="whiteAlpha.600" mt={1}>{fileMeta.label}</Text>
            </Box>
            <VStack gap={2}>
              <Badge colorPalette={fileMeta.badgeColor} variant="solid" px={3} py={1} borderRadius="full" fontSize="xs">
                {fileMeta.badge}
              </Badge>
              <Text fontSize="xs" color="whiteAlpha.500">{fileMeta.method}</Text>
            </VStack>
            <Button mt={2} variant="outline" color="whiteAlpha.600" borderColor="whiteAlpha.300" onClick={handleClear} size="sm" borderRadius="full">
              Change File
            </Button>
          </VStack>
        ) : (
          // ─── Default Upload State ─────────────────────────────────────────
          <VStack gap={5}>
            <Box
              p={6}
              borderRadius="full"
              bg="rgba(0,0,0,0.3)"
              borderWidth={1}
              borderColor="whiteAlpha.200"
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
              _hover={{ borderColor: 'green.400', bg: 'rgba(74,222,128,0.05)' }}
              transition="all 0.2s"
            >
              <UploadCloud size={48} color="#718096" />
            </Box>

            <Box>
              <Text fontWeight="bold" color="white" mb={2} fontSize="lg">
                Upload Document or Image to Verify
              </Text>
              <Text fontSize="sm" color="whiteAlpha.600" maxW="360px" mx="auto">
                Upload a PDF, scanned certificate, or image document. Processing happens locally in your browser.
              </Text>
            </Box>

            {/* Supported formats */}
            <HStack gap={2} flexWrap="wrap" justify="center">
              <Badge colorPalette="blue" variant="outline" px={3} py={1} borderRadius="full" fontSize="xs">
                <FileText size={11} style={{ display: 'inline', marginRight: 4 }} />
                PDF
              </Badge>
              <Badge colorPalette="purple" variant="outline" px={3} py={1} borderRadius="full" fontSize="xs">
                <Image size={11} style={{ display: 'inline', marginRight: 4 }} />
                JPG
              </Badge>
              <Badge colorPalette="purple" variant="outline" px={3} py={1} borderRadius="full" fontSize="xs">
                <Image size={11} style={{ display: 'inline', marginRight: 4 }} />
                JPEG
              </Badge>
              <Badge colorPalette="purple" variant="outline" px={3} py={1} borderRadius="full" fontSize="xs">
                <Image size={11} style={{ display: 'inline', marginRight: 4 }} />
                PNG
              </Badge>
            </HStack>

            <Flex gap={3} flexDir={{ base: 'column', sm: 'row' }}>
              <Button
                size="lg"
                colorPalette="green"
                onClick={() => fileInputRef.current?.click()}
                px={8}
                borderRadius="full"
              >
                Select File
              </Button>
            </Flex>

            <Text fontSize="xs" color="whiteAlpha.400" mt={1}>
              Zero files uploaded to server. All processing happens locally.
            </Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default VerificationUpload;
