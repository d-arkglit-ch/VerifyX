import React, { useState } from 'react';
import { Box, Container, VStack, Heading, Text, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import SealIdForm from '../components/SealIdForm';

const VerifyEntry = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (sealId) => {
    setLoading(true);
    // Simulate a brief loading state before navigating
    setTimeout(() => {
      navigate(`/verify/${sealId}`);
    }, 500);
  };

  return (
    <Box minH="100vh" bg="black" color="white" pt={12} pb={12} position="relative" overflow="hidden">
      {/* Background glow effect */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="600px"
        h="600px"
        bg="green.900"
        filter="blur(150px)"
        opacity={0.15}
        zIndex={0}
        pointerEvents="none"
      />

      <Container maxW="container.md" position="relative" zIndex={1}>
        <Box
          as="button"
          onClick={() => navigate('/')}
          display="flex"
          alignItems="center"
          gap={2}
          color="whiteAlpha.600"
          _hover={{ color: 'white' }}
          mb={12}
          transition="all 0.2s"
        >
          <ArrowLeft size={16} />
          <Text fontSize="sm" fontWeight="medium">Back to Home</Text>
        </Box>

        <VStack gap={8} align="center">
          <Flex align="center" gap={4} flexDir="column" textAlign="center">
            <Box
              boxSize={16}
              bg="green.950"
              borderRadius="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor="green.800"
            >
              <ShieldCheck size={32} color="#4ade80" />
            </Box>
            <Box>
              <Heading size="2xl" fontWeight="black" letterSpacing="tight" mb={3}>
                Verify a Document
              </Heading>
              <Text fontSize="md" color="whiteAlpha.600" maxW="400px" mx="auto" lineHeight="tall">
                Enter the unique cryptographic Seal ID found on the document to begin the zero-knowledge verification process.
              </Text>
            </Box>
          </Flex>

          <SealIdForm onSubmit={handleSubmit} loading={loading} />
        </VStack>
      </Container>
    </Box>
  );
};

export default VerifyEntry;
