import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Heading,
  Separator,
  Button
} from '@chakra-ui/react';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';

const VerificationResult = ({ verificationData, onReset }) => {
  if (!verificationData) return null;

  const { result, message, confidence } = verificationData;

  // Determine theme colors and copy based on result
  let theme = {
    color: 'green.400',
    hexColor: '#4ade80',
    bg: 'rgba(74, 222, 128, 0.05)',
    border: 'green.500',
    shadowColor: 'rgba(74, 222, 128, 0.2)',
    icon: CheckCircle,
    title: 'Document Verified',
    subtitle: 'No meaningful tampering detected.',
    summary: 'Document matches the original issued version. Cryptographic seals are intact.'
  };

  if (result === 'YELLOW') {
    theme = {
      color: 'yellow.400',
      hexColor: '#ecc94b',
      bg: 'rgba(236, 201, 75, 0.05)',
      border: 'yellow.500',
      shadowColor: 'rgba(236, 201, 75, 0.2)',
      icon: AlertTriangle,
      title: 'Minor Differences Detected',
      subtitle: 'Semantic content mostly matches.',
      summary: 'Minor visual or formatting differences detected, but semantic content remains similar. This often happens if the document was scanned, compressed, or screenshotted.'
    };
  } else if (result === 'RED') {
    theme = {
      color: 'red.400',
      hexColor: '#f56565',
      bg: 'rgba(245, 101, 101, 0.05)',
      border: 'red.500',
      shadowColor: 'rgba(245, 101, 101, 0.2)',
      icon: XCircle,
      title: 'Document Tampered',
      subtitle: 'Critical mismatch detected.',
      summary: 'Critical semantic or cryptographic mismatch detected. This document may have been altered or is a counterfeit.'
    };
  }

  const IconComponent = theme.icon;

  const renderConfidenceBar = (label, value) => (
    <Box w="full" mt={3}>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize="xs" fontWeight="bold" color={value >= 85 ? 'green.400' : value >= 65 ? 'yellow.400' : 'red.400'}>
          {value}%
        </Text>
      </Flex>
      <Box w="100%" h="6px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
        <Box 
          h="100%" 
          bg={value >= 85 ? 'green.400' : value >= 65 ? 'yellow.400' : 'red.400'} 
          w={`${value}%`} 
          transition="width 1s ease-out" 
        />
      </Box>
    </Box>
  );

  return (
    <Box
      p={8}
      bg={theme.bg}
      borderWidth={2}
      borderColor={theme.border}
      borderRadius="2xl"
      h="100%"
      display="flex"
      flexDirection="column"
      position="relative"
      boxShadow={`0 0 40px -10px ${theme.shadowColor}`}
    >
      <VStack gap={6} align="center" textAlign="center" flex={1} justifyContent="center">
        
        {/* Status Icon & Header */}
        <VStack gap={3}>
          <Box p={4} borderRadius="full" bg={`rgba(0,0,0,0.4)`} borderWidth={1} borderColor={theme.border}>
            <IconComponent size={56} color={theme.hexColor} />
          </Box>
          <Badge colorPalette={result === 'GREEN' ? 'green' : result === 'YELLOW' ? 'yellow' : 'red'} variant="solid" size="lg" px={4} py={1} borderRadius="full">
            {result} STATE
          </Badge>
          <Heading size="lg" color="white" mt={2}>
            {theme.title}
          </Heading>
          <Text fontSize="md" color="whiteAlpha.800" fontWeight="medium">
            {theme.subtitle}
          </Text>
        </VStack>

        <Separator borderColor="whiteAlpha.200" w="80%" />

        {/* Breakdown */}
        <Box w="full" bg="rgba(0,0,0,0.4)" p={6} borderRadius="xl" borderWidth={1} borderColor="whiteAlpha.100">
          <Text fontSize="sm" color="whiteAlpha.900" mb={4} textAlign="left">
            {theme.summary}
          </Text>
          
          <VStack gap={4} align="stretch">
            {confidence?.overall !== undefined && renderConfidenceBar('Overall Confidence', confidence.overall)}
          </VStack>
        </Box>

        {/* Backend Message */}
        <Text fontSize="xs" color="whiteAlpha.500" fontStyle="italic">
          System: {message}
        </Text>

        {/* Tampering Reasons */}
        {(result === 'RED' || result === 'YELLOW') && verificationData.reasons && verificationData.reasons.length > 0 && (
          <Box 
            w="full" 
            bg={result === 'RED' ? "rgba(245, 101, 101, 0.1)" : "rgba(236, 201, 75, 0.1)"} 
            p={4} 
            borderRadius="xl" 
            borderWidth={1} 
            borderColor={result === 'RED' ? "red.500" : "yellow.500"}
          >
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              color={result === 'RED' ? "red.300" : "yellow.300"} 
              mb={2} 
              textAlign="left"
            >
              {result === 'RED' ? 'Tampering Details:' : 'Discrepancy Details:'}
            </Text>
            <VStack align="stretch" gap={2}>
              {verificationData.reasons.map((reason, index) => (
                <Text 
                  key={index} 
                  fontSize="sm" 
                  color={result === 'RED' ? "red.200" : "yellow.200"} 
                  textAlign="left" 
                  display="flex" 
                  alignItems="flex-start" 
                  gap={2}
                >
                  <Text as="span" color={result === 'RED' ? "red.500" : "yellow.500"}>•</Text> {reason}
                </Text>
              ))}
            </VStack>
          </Box>
        )}

        <Button
          mt={4}
          variant="outline"
          color="whiteAlpha.800"
          borderColor="whiteAlpha.300"
          onClick={onReset}
          size="md"
          borderRadius="full"
          _hover={{ bg: 'whiteAlpha.100' }}
        >
          <Flex align="center" gap={2}>
            <RotateCcw size={16} />
            <Text>Verify Another Document</Text>
          </Flex>
        </Button>
      </VStack>
    </Box>
  );
};

export default VerificationResult;
