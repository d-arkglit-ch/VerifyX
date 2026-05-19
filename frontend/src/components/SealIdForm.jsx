import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Flex,
  Icon
} from '@chakra-ui/react';
import { Search } from 'lucide-react';

const SealIdForm = ({ onSubmit, loading }) => {
  const [sealId, setSealId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sealId.trim()) {
      setError('Please enter a valid Seal ID');
      return;
    }
    setError('');
    onSubmit(sealId.trim());
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      w="100%"
      maxW="md"
      p={6}
      bg="rgba(255,255,255,0.03)"
      borderWidth={1}
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      boxShadow="xl"
    >
      <VStack gap={4} align="stretch">
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.700" mb={2} textTransform="uppercase">
            Document Seal ID
          </Text>
          <Flex align="center" position="relative">
            <Box position="absolute" left={3} zIndex={1}>
              <Search size={18} color="#718096" />
            </Box>
            <Input
              placeholder="e.g. DOC-82AF91"
              value={sealId}
              onChange={(e) => {
                setSealId(e.target.value);
                if (error) setError('');
              }}
              pl={10}
              size="lg"
              bg="rgba(0,0,0,0.3)"
              border="1px solid"
              borderColor={error ? "red.400" : "whiteAlpha.200"}
              color="white"
              _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px #48bb78" }}
              disabled={loading}
              textTransform="uppercase"
            />
          </Flex>
          {error && (
            <Text color="red.400" fontSize="xs" mt={2}>
              {error}
            </Text>
          )}
        </Box>

        <Button
          type="submit"
          size="lg"
          bg="green.600"
          color="white"
          _hover={{ bg: 'green.500' }}
          loading={loading}
          disabled={loading}
          w="full"
          height="50px"
          borderRadius="lg"
          fontWeight="bold"
        >
          Verify Document
        </Button>
      </VStack>
    </Box>
  );
};

export default SealIdForm;
