import React from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Heading,
  Badge,
  Skeleton,
  Stack,
  Separator
} from '@chakra-ui/react';
import { ShieldCheck, User, Calendar, Building, Hash } from 'lucide-react';

const MetadataRow = ({ icon: IconComp, label, value, isLoading }) => (
  <Flex align="center" gap={3}>
    <Box p={2} bg="rgba(255,255,255,0.05)" borderRadius="md">
      <IconComp size={16} color="#718096" />
    </Box>
    <Box flex={1}>
      <Text fontSize="xs" color="whiteAlpha.500" fontWeight="bold" textTransform="uppercase">
        {label}
      </Text>
      {isLoading ? (
        <Skeleton h="16px" w="150px" mt={1} borderRadius="sm" />
      ) : (
        <Text fontSize="sm" color="white" fontWeight="medium">
          {value || '---'}
        </Text>
      )}
    </Box>
  </Flex>
);

const VerificationMetadataCard = ({ sealId, isLoading, metadata }) => {
  return (
    <Box
      p={6}
      bg="rgba(255,255,255,0.03)"
      borderWidth={1}
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      w="100%"
    >
      <Flex align="center" gap={3} mb={6}>
        <Box
          p={2}
          bg="green.950"
          borderRadius="lg"
          border="1px solid"
          borderColor="green.800"
        >
          <ShieldCheck size={20} color="#4ade80" />
        </Box>
        <Heading size="md" color="white">
          Document Metadata
        </Heading>
        {isLoading ? (
          <Skeleton ml="auto" h="20px" w="60px" borderRadius="full" />
        ) : (
          <Badge ml="auto" colorPalette="green" variant="surface" borderRadius="full">
            SEAL FOUND
          </Badge>
        )}
      </Flex>

      <Separator borderColor="whiteAlpha.100" mb={6} />

      <Stack gap={5}>
        <MetadataRow
          icon={Hash}
          label="Seal ID"
          value={sealId}
          isLoading={isLoading}
        />
        <MetadataRow
          icon={User}
          label="Issued To"
          value={metadata?.issuedTo}
          isLoading={isLoading}
        />
        <MetadataRow
          icon={Building}
          label="Issued By"
          value={metadata?.issuedBy}
          isLoading={isLoading}
        />
        <MetadataRow
          icon={Calendar}
          label="Issue Date"
          value={metadata?.issueDate ? new Date(metadata.issueDate).toLocaleDateString() : null}
          isLoading={isLoading}
        />
        <MetadataRow
          icon={ShieldCheck}
          label="Document Type"
          value={metadata?.documentType}
          isLoading={isLoading}
        />
      </Stack>
    </Box>
  );
};

export default VerificationMetadataCard;
