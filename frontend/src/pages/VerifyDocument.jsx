import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  Heading,
  Text,
  Button,
  Flex,
  Alert
} from '@chakra-ui/react';
import { ArrowLeft, FileSearch } from 'lucide-react';
import VerificationMetadataCard from '../components/VerificationMetadataCard';
import VerificationUpload from '../components/VerificationUpload';
import VerificationResult from '../components/VerificationResult';
import useVerificationProcessing from '../hooks/useVerificationProcessing';
import axios from 'axios';

const VerifyDocument = () => {
  const { sealId } = useParams();
  const navigate = useNavigate();

  // Phase 2 states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  // Phase 3 states
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    processFile,
    loading: processing,
    progress,
    result,
    error: processingError,
    reset: resetProcessing,
  } = useVerificationProcessing();

  // Phase 5.5 states
  const [apiVerificationResult, setApiVerificationResult] = useState(null);
  const [apiVerificationLoading, setApiVerificationLoading] = useState(false);
  const [apiVerificationError, setApiVerificationError] = useState(null);

  const SUPPORTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  const handleFileSelect = (file) => {
    resetProcessing();
    setApiVerificationResult(null);
    setApiVerificationError(null);

    if (file && !SUPPORTED_TYPES.includes(file.type)) {
      setSelectedFile(file); // Still set so the upload card can show the UNSUPPORTED state
      setError(`Unsupported file type: ${file.type || 'unknown'}. Please upload a PDF, JPG, JPEG, or PNG.`);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    resetProcessing();
    setApiVerificationResult(null);
    setApiVerificationError(null);
  };

  // Trigger backend verification automatically once local processing completes
  useEffect(() => {
    const verifyWithBackend = async () => {
      if (!result || !sealId) return;
      
      setApiVerificationLoading(true);
      setApiVerificationError(null);
      
      try {
        const response = await axios.post('http://localhost:5000/api/verify/compare', {
          sealId,
          ...result
        });
        setApiVerificationResult(response.data);
      } catch (err) {
        setApiVerificationError(err.response?.data?.message || "Failed to communicate with verification engine.");
      } finally {
        setApiVerificationLoading(false);
      }
    };

    if (result && !apiVerificationResult && !apiVerificationLoading) {
      verifyWithBackend();
    }
  }, [result, sealId]);

  useEffect(() => {
    const fetchSealMetadata = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/document/${sealId}`);
        const data = response.data.data || response.data;
        setMetadata(data);
      } catch (err) {
        setError(err.response?.data?.message || "Invalid Seal ID or document not found.");
        setMetadata(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (sealId) {
      fetchSealMetadata();
    } else {
      setError("No Seal ID provided.");
      setIsLoading(false);
    }
  }, [sealId]);

  return (
    <Box minH="100vh" bg="black" color="white" pt={8} pb={12} position="relative" overflow="hidden">
      {/* Background glow effect */}
      <Box
        position="absolute"
        top="-10%"
        left="-10%"
        w="500px"
        h="500px"
        bg="green.900"
        filter="blur(150px)"
        opacity={0.1}
        zIndex={0}
        pointerEvents="none"
      />

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Box
          as="button"
          onClick={() => navigate('/manual-verify')}
          display="flex"
          alignItems="center"
          gap={2}
          color="whiteAlpha.600"
          _hover={{ color: 'white' }}
          mb={8}
          transition="all 0.2s"
        >
          <ArrowLeft size={16} />
          <Text fontSize="sm" fontWeight="medium">Back to Seal Entry</Text>
        </Box>

        <Flex align="center" gap={4} mb={8}>
          <Box
            boxSize={12}
            bg="green.950"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor="green.800"
          >
            <FileSearch size={24} color="#4ade80" />
          </Box>
          <Box>
            <Heading size="xl" fontWeight="black" letterSpacing="tight">
              Verification Engine
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.500" mt={1}>
              Secure, zero-knowledge document verification
            </Text>
          </Box>
        </Flex>

        {(error || processingError || apiVerificationError) && (
          <Alert.Root status="error" mb={8} bg="red.900" borderColor="red.500" borderWidth={1} color="white">
            <Alert.Indicator color="red.300" />
            <Alert.Content>
              <Alert.Title>Verification Error</Alert.Title>
              <Alert.Description>{error || processingError || apiVerificationError}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <Grid templateColumns={{ base: '1fr', lg: '4fr 6fr' }} gap={8}>
          {/* LEFT SIDE: Metadata */}
          <GridItem>
            <VerificationMetadataCard sealId={sealId} isLoading={isLoading} metadata={metadata} />
          </GridItem>

          {/* RIGHT SIDE: Verification Upload and Processing */}
          <GridItem>
            {apiVerificationResult ? (
              <VerificationResult 
                verificationData={apiVerificationResult} 
                onReset={handleReset} 
              />
            ) : (
              <VStack gap={4} align="stretch" h="100%">
                <VerificationUpload
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  loading={processing || apiVerificationLoading}
                  progress={apiVerificationLoading ? { stage: 'Contacting Verification Engine...', percent: 100 } : progress}
                  result={null}
                  error={processingError}
                  hashAlgorithm={metadata?.hashAlgorithm}
                />
                {selectedFile && !result && !processing && !apiVerificationLoading &&
                  SUPPORTED_TYPES.includes(selectedFile?.type) && (
                  <Button
                    size="lg"
                    colorPalette="green"
                    w="full"
                    onClick={handleProcess}
                    borderRadius="full"
                    fontWeight="bold"
                  >
                    Process Document
                  </Button>
                )}
              </VStack>
            )}
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default VerifyDocument;
