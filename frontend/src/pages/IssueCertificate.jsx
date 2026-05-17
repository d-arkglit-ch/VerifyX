import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Flex,
  Badge,
  Input,
  GridItem,
  Grid,
  VStack,
  Spinner,
  Skeleton,
  Icon
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { toaster } from '../components/ui/toaster';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  UploadCloud,
  ShieldCheck,
  CheckCircle,
  FileText,
  Clock,
  Activity,
  ChevronLeft
} from "lucide-react";

const IssueCertificate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Form state
  const [file, setFile] = useState(null);
  const [issuedTo, setIssuedTo] = useState('');
  const [issuedBy, setIssuedBy] = useState(user?.organization || user?.name || "Registrar's Office");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [documentType, setDocumentType] = useState('Academic Degree');

  // Issuance State
  const [isIssuing, setIsIssuing] = useState(false);
  const [sealData, setSealData] = useState(null);

  // History State
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/documents/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistory(res.data.data || []);
    } catch (err) {
      console.error('History fetch error', err);
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleReset = () => {
    // Reset state for new issuance
    setFile(null);
    setIssuedTo('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDocumentType('Academic Degree');
    setSealData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    if (sealData) return; // Locked
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) {
        setFile(f);
        setSealData(null);
      } else {
        toaster.create({ title: 'Invalid File', description: 'Please upload a PDF, PNG, or JPG.', type: 'error' });
      }
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (sealData) return; // Locked
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleSeal = async () => {
    /* 
     * INTERVIEW NOTE: Duplicate Issuance Prevention
     * We block execution if the document is already sealed (`sealData` exists) or if an API call is currently in progress (`isIssuing`).
     * This prevents duplicate network requests and ensures a single document cannot be sealed twice by impatient clicking,
     * maintaining database integrity and a strict 1-to-1 relationship between an uploaded file and a seal.
     */
    if (isIssuing || sealData) return;

    if (!file || !issuedTo || !issuedBy || !issueDate || !documentType) {
      toaster.create({ title: 'Missing fields', description: 'Please fill in all metadata fields and upload a file.', type: 'error' });
      return;
    }

    setIsIssuing(true);
    setSealData(null); // Clear previous state

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('issuedTo', issuedTo);
      formData.append('issuedBy', issuedBy);
      formData.append('issueDate', issueDate);
      formData.append('documentType', documentType);

      const res = await axios.post('http://localhost:5000/api/documents/issue', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSealData(res.data);
      /*
       * INTERVIEW NOTE: Dynamic History Updates
       * We re-fetch the history immediately upon success instead of forcing a full page reload.
       * This leverages React's state management to seamlessly prepend the new document 
       * to the UI's Recent History list, providing a highly responsive SPA experience.
       */
      fetchHistory();
      toaster.create({ title: 'Success', description: 'Document sealed successfully.', type: 'success' });
    } catch (err) {
      console.error("Issuance failed:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || 'Failed to issue document. Check backend logs.';
      toaster.create({ title: 'Issuance Error', description: errorMsg, type: 'error' });
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <Box minH="100vh" bg="black" color="white" pt={8} pb={12} overflowX="hidden">
      <Box
        position="fixed"
        top="0"
        left="50%"
        transform="translateX(-50%)"
        w="800px"
        h="400px"
        bg="green.900"
        filter="blur(200px)"
        opacity={0.06}
        zIndex={0}
        pointerEvents="none"
      />

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Button variant="ghost" color="whiteAlpha.600" mb={6} _hover={{ color: 'white', bg: 'whiteAlpha.100' }} onClick={() => navigate('/dashboard')}>
          <ChevronLeft size={16} style={{ marginRight: '4px' }} /> Back to Dashboard
        </Button>

        <Grid templateColumns={{ base: "1fr", lg: "7fr 3fr" }} gap={8}>
          {/* LEFT SECTION */}
          <GridItem>
            <Stack gap={6}>
              {/* Card 1: Issue New Certificate */}
              <Box bg="rgba(255,255,255,0.03)" p={8} borderRadius="2xl" borderWidth={1} borderColor="whiteAlpha.100">
                <Flex align="center" gap={3} mb={6}>
                  <Box p={2} bg="green.950" borderRadius="lg" border="1px solid" borderColor="green.800">
                    <FileText size={20} color="#4ade80" />
                  </Box>
                  <Heading size="md" color="white">Issue New Certificate</Heading>
                </Flex>

                <Box
                  border="2px dashed"
                  borderColor={file ? "green.500" : "whiteAlpha.200"}
                  borderRadius="xl"
                  p={10}
                  textAlign="center"
                  bg={file ? "rgba(74, 222, 128, 0.05)" : "rgba(0,0,0,0.2)"}
                  cursor={sealData ? "not-allowed" : "pointer"}
                  opacity={sealData ? 0.6 : 1}
                  onClick={() => !sealData && fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  _hover={{ borderColor: sealData ? "whiteAlpha.200" : "green.500" }}
                  transition="all 0.2s"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" disabled={!!sealData} />
                  <Box display="flex" justifyContent="center" mb={4}>
                    <UploadCloud size={48} color={file ? "#4ade80" : "#718096"} />
                  </Box>
                  {file ? (
                    <VStack gap={2}>
                      <Text fontWeight="bold" color="green.400">{file.name}</Text>
                      <Badge bg="green.950" color="green.400" border="1px solid" borderColor="green.800">File Selected</Badge>
                    </VStack>
                  ) : (
                    <VStack gap={2}>
                      <Heading size="sm" color="white">Upload Document</Heading>
                      <Text fontSize="sm" color="whiteAlpha.500">Drag and drop your PDF or image here, or click to browse.</Text>
                      <Button mt={4} bg="green.600" color="white" _hover={{ bg: "green.500" }}>Select File</Button>
                    </VStack>
                  )}
                </Box>
              </Box>

              {/* Card 2: Certificate Metadata */}
              <Box bg="rgba(255,255,255,0.03)" p={8} borderRadius="2xl" borderWidth={1} borderColor="whiteAlpha.100">
                <Flex align="center" gap={3} mb={6}>
                  <Box p={2} bg="green.950" borderRadius="lg" border="1px solid" borderColor="green.800">
                    <ShieldCheck size={20} color="#4ade80" />
                  </Box>
                  <Heading size="sm" color="white">Certificate Metadata</Heading>
                </Flex>

                <Stack gap={5}>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.600" mb={2} textTransform="uppercase">Document Type</Text>
                    <Box>
                      <Input
                        list="document-types"
                        placeholder="Select or type document type"
                        bg="rgba(0,0,0,0.2)"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        color="white"
                        p={3}
                        borderRadius="md"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        disabled={!!sealData}
                        opacity={sealData ? 0.6 : 1}
                        _focus={{ borderColor: "green.500", boxShadow: "none" }}
                      />

                      <datalist id="document-types">
                        <option value="Academic Degree" />
                        <option value="Medical Report" />
                        <option value="Legal Document" />
                        <option value="Offer Letter" />
                      </datalist>
                    </Box>
                  </Box>
                  <Box>
                    {/* 
                      INTERVIEW NOTE: Document Locking
                      We disable these inputs when `sealData` exists. Once a document is cryptographically sealed in the database, 
                      its metadata is strictly anchored to its hash. Allowing users to alter metadata on a finalized seal 
                      would misrepresent the cryptographically proven state, so the form is locked.
                    */}
                    <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.600" mb={2} textTransform="uppercase">Issued To</Text>
                    <Input placeholder="e.g. Jane Doe or 0x..." value={issuedTo} onChange={(e) => setIssuedTo(e.target.value)} bg="rgba(0,0,0,0.2)" borderColor="whiteAlpha.200" _focus={{ borderColor: "green.500" }} disabled={!!sealData} opacity={sealData ? 0.6 : 1} />
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.600" mb={2} textTransform="uppercase">Issuer Department</Text>
                    <Input placeholder="Registrar's Office" value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} bg="rgba(0,0,0,0.2)" borderColor="whiteAlpha.200" _focus={{ borderColor: "green.500" }} disabled={!!sealData} opacity={sealData ? 0.6 : 1} />
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.600" mb={2} textTransform="uppercase">Issue Date</Text>
                    <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} bg="rgba(0,0,0,0.2)" borderColor="whiteAlpha.200" _focus={{ borderColor: "green.500" }} disabled={!!sealData} opacity={sealData ? 0.6 : 1} />
                  </Box>
                </Stack>
              </Box>

              {/* Card 3: Preview Seal (ONLY SHOWN IF API SUCCEEDS) */}
              {sealData ? (
                <Box bg="rgba(74, 222, 128, 0.05)" p={8} borderRadius="2xl" borderWidth={1} borderColor="green.500">
                  <VStack align="center" gap={4}>
                    <CheckCircle size={48} color="#4ade80" />
                    <Heading size="md" color="white">Issuance Successful!</Heading>

                    <Box p={6} bg="rgba(0,0,0,0.3)" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.200" mt={2} mb={2}>
                      <Box boxSize="150px" bg="white" p={2} borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                        {sealData.qrCode ? <img src={sealData.qrCode} alt="QR Code" /> : <Icon as={ShieldCheck} size={80} color="gray.300" />}
                      </Box>
                    </Box>

                    <Badge bg="green.950" color="green.400" fontSize="md" px={4} py={2} borderRadius="md" border="1px solid" borderColor="green.800">
                      SEAL ID: {sealData.sealId}
                    </Badge>

                    <Text fontSize="sm" color="whiteAlpha.600" textAlign="center" maxW="400px" mt={2}>
                      Generated cryptographic seal anchored on {new Date(sealData.metadata?.createdAt || Date.now()).toLocaleString()}
                    </Text>
                  </VStack>
                  <Button mt={8} w="full" variant="outline" borderColor="green.500" color="green.400" _hover={{ bg: "rgba(74, 222, 128, 0.1)" }} onClick={handleReset}>
                    + Issue Another Document
                  </Button>
                </Box>
              ) : (
                <Box bg="rgba(255,255,255,0.03)" p={8} borderRadius="2xl" borderWidth={1} borderColor="whiteAlpha.100" textAlign="center">
                  <Text color="whiteAlpha.500">Seal preview will appear here after successful issuance.</Text>
                </Box>
              )}
            </Stack>
          </GridItem>

          {/* RIGHT SECTION */}
          <GridItem>
            <Stack gap={6}>
              {/* Card 1: Recent Issuance History */}
              <Box bg="rgba(255,255,255,0.03)" p={6} borderRadius="2xl" borderWidth={1} borderColor="whiteAlpha.100">
                <Flex align="center" gap={3} mb={6}>
                  <Clock size={18} color="#4ade80" />
                  <Heading size="sm" color="white">Recent History</Heading>
                </Flex>

                <Stack gap={3}>
                  {isLoadingHistory ? (
                    [1, 2, 3].map(i => <Skeleton key={i} h="60px" w="full" borderRadius="lg" startColor="whiteAlpha.100" endColor="whiteAlpha.300" />)
                  ) : history.length > 0 ? (
                    <>
                      {history.slice(0, 5).map((item, idx) => (
                        <Flex key={idx} justify="space-between" align="center" p={3} bg="rgba(0,0,0,0.2)" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.50">
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color="white">{item.fileName || item.documentType}</Text>
                            <Text fontSize="xs" color="whiteAlpha.700" mt={1}>{item.issuedTo}</Text>
                            <Text fontSize="xs" color="whiteAlpha.500">{new Date(item.createdAt).toLocaleDateString()} • {item.sealId}</Text>
                          </Box>
                          <Badge bg="green.950" color="green.400" border="1px solid" borderColor="green.800" px={2} py={1} borderRadius="md">
                            Sealed
                          </Badge>
                        </Flex>
                      ))}
                      {history.length > 5 && (
                        <Button variant="ghost" size="sm" color="green.400" _hover={{ bg: 'whiteAlpha.100' }} mt={2} onClick={() => navigate('/history')}>
                          View all history records
                        </Button>
                      )}
                    </>
                  ) : (
                    <Text fontSize="sm" color="whiteAlpha.500" textAlign="center" py={4}>No real history found.</Text>
                  )}
                </Stack>
              </Box>

              {/* Bottom Action Button */}
              <Button
                size="lg"
                w="full"
                bg={sealData ? "green.900" : "green.600"}
                color={sealData ? "whiteAlpha.500" : "white"}
                _hover={{ bg: sealData ? "green.900" : 'green.500' }}
                onClick={handleSeal}
                disabled={isIssuing || !!sealData}
                mt={4}
                height="60px"
                cursor={sealData ? "not-allowed" : "pointer"}
              >
                {isIssuing ? <Spinner size="sm" color="white" /> : (sealData ? "Document Already Sealed" : "Finalize & Seal")}
              </Button>
            </Stack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default IssueCertificate;
