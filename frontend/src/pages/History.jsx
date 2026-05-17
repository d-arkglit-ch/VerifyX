import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Badge,
  Spinner,
  Table,
  Button,
  Icon,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ChevronLeft,
  Clock,
  Search,
  FileText,
} from "lucide-react";

const History = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch history records
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/documents/history?limit=100",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setHistory(res.data.data || []);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="black"
      color="white"
      py={10}
    >
      <Container maxW="container.xl">

        {/* Back Button */}
        <Button
          mb={6}
          variant="ghost"
          color="whiteAlpha.700"
          _hover={{
            bg: "whiteAlpha.100",
            color: "white",
          }}
          onClick={() => navigate("/issue-document")}
        >
          <ChevronLeft size={16} />
          <Text ml={1}>Back to Issuance</Text>
        </Button>

        {/* Page Header */}
        <Flex align="center" gap={4} mb={8}>
          <Box
            p={3}
            borderRadius="xl"
            bg="green.950"
            border="1px solid"
            borderColor="green.800"
          >
            <Clock size={24} color="#4ade80" />
          </Box>

          <Box>
            <Heading size="lg">
              All History Records
            </Heading>

            <Text
              color="whiteAlpha.600"
              mt={1}
            >
              A complete history of all sealed documents.
            </Text>
          </Box>
        </Flex>

        {/* Main Card */}
        <Box
          bg="rgba(255,255,255,0.03)"
          borderRadius="2xl"
          border="1px solid"
          borderColor="whiteAlpha.100"
          overflow="hidden"
        >
          {/* Loading */}
          {isLoading ? (
            <Flex
              justify="center"
              align="center"
              py={20}
            >
              <Spinner
                size="xl"
                color="green.400"
              />
            </Flex>
          ) : history.length === 0 ? (

            /* Empty State */
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={20}
              gap={4}
            >
              <Search
                size={48}
                color="rgba(255,255,255,0.2)"
              />

              <Text color="whiteAlpha.500">
                No history records found.
              </Text>
            </Flex>

          ) : (

            /* Table */
            <Box overflowX="auto">

              <Table.Root variant="unstyled">

                {/* Table Header */}
                <Table.Header bg="rgba(255,255,255,0.03)">

                  <Table.Row>

                    <Table.ColumnHeader
                      color="whiteAlpha.500"
                      py={5}
                    >
                      DOCUMENT
                    </Table.ColumnHeader>

                    <Table.ColumnHeader
                      color="whiteAlpha.500"
                    >
                      ISSUED TO
                    </Table.ColumnHeader>

                    <Table.ColumnHeader
                      color="whiteAlpha.500"
                    >
                      SEAL ID
                    </Table.ColumnHeader>

                    <Table.ColumnHeader
                      color="whiteAlpha.500"
                    >
                      DATE
                    </Table.ColumnHeader>

                    <Table.ColumnHeader
                      color="whiteAlpha.500"
                      textAlign="right"
                    >
                      STATUS
                    </Table.ColumnHeader>

                  </Table.Row>
                </Table.Header>

                {/* Table Body */}
                <Table.Body>

                  {history.map((doc, index) => (

                    <Table.Row
                      key={doc._id || index}
                      borderBottom="1px solid"
                      borderColor="whiteAlpha.100"
                      transition="0.2s"
                      _hover={{
                        bg: "rgba(74,222,128,0.05)",
                      }}
                    >

                      {/* Document */}
                      <Table.Cell py={5}>

                        <Flex align="center" gap={3}>

                          <Box
                            p={2}
                            borderRadius="lg"
                            bg="green.950"
                            border="1px solid"
                            borderColor="green.800"
                          >
                            <Icon
                              as={FileText}
                              boxSize={4}
                              color="green.400"
                            />
                          </Box>

                          <Box>
                            <Text
                              fontWeight="bold"
                              fontSize="sm"
                            >
                              {doc.fileName || doc.documentType}
                            </Text>

                            <Text
                              fontSize="xs"
                              color="whiteAlpha.500"
                            >
                              Digitally sealed
                            </Text>
                          </Box>

                        </Flex>
                      </Table.Cell>

                      {/* Issued To */}
                      <Table.Cell>
                        <Text
                          fontSize="sm"
                          color="whiteAlpha.800"
                        >
                          {doc.issuedTo}
                        </Text>
                      </Table.Cell>

                      {/* Seal ID */}
                      <Table.Cell>

                        <Text
                          fontFamily="mono"
                          fontSize="xs"
                          color="green.300"
                          bg="rgba(74,222,128,0.08)"
                          px={3}
                          py={1}
                          borderRadius="md"
                          display="inline-block"
                        >
                          {doc.sealId}
                        </Text>

                      </Table.Cell>

                      {/* Date */}
                      <Table.Cell>

                        <Text
                          fontSize="sm"
                          color="whiteAlpha.700"
                        >
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </Text>

                        <Text
                          fontSize="xs"
                          color="whiteAlpha.500"
                        >
                          {new Date(doc.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>

                      </Table.Cell>

                      {/* Status */}
                      <Table.Cell textAlign="right">

                        <Badge
                          px={3}
                          py={1}
                          borderRadius="full"
                          bg="green.950"
                          color="green.300"
                          border="1px solid"
                          borderColor="green.800"
                        >
                          SEALED
                        </Badge>

                      </Table.Cell>

                    </Table.Row>
                  ))}

                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default History;