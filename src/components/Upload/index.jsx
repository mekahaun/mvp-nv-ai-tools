"use client";

import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import FormFieldCustom from "../ui/custom/FormFieldCustom";
import FormInput from "../ui/custom/FormInput";
import FormInputFile from "../ui/custom/FormInputFile";
import {
  finalizeMultipartUpload,
  getPresignedUrls,
  initiateUpload,
  uploadPart,
} from "./utils/formHandlers";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  // "application/msword",
  // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // "application/vnd.ms-excel",
  // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // "text/plain",
];
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunk size

const Upload = () => {
  const [isFormSubmitting, setFormSubmitting] = useState(false);

  const schema = z.object({
    email: z
      .string({
        required_error: "Email is required.",
      })
      .email({ message: "Invalid email address." }),
    file: z
      .custom((value) => value instanceof FileList, {
        message: "File is required.",
      })
      .refine((fileList) => fileList?.length === 1, {
        message: "File is required.",
      })
      .refine(
        (fileList) =>
          fileList && ACCEPTED_FILE_TYPES.includes(fileList[0]?.type),
        {
          message: "Only PDF files are allowed.",
          // message: "Only PDF, DOC, DOCX, XLS, XLSX, and TXT files are allowed.",
        }
      )
      .refine((fileList) => fileList && fileList[0]?.size <= MAX_FILE_SIZE, {
        message: "File size must be less than 100MB.",
      }),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      // subject: "",
      // chapter: "",
      email: "",
      // response_type: "",
      // file: null,
      // description: "",
    },
    mode: "onChange",
  });

  const { reset } = form;

  const onSubmit = async (values) => {
    setFormSubmitting(true);
    const { email, file } = values;

    try {
      const documentFile = file[0];
      if (!documentFile || !ACCEPTED_FILE_TYPES.includes(documentFile.type)) {
        throw new Error("Please select a valid document file to upload.");
      }

      console.log(
        "Starting upload for file:",
        documentFile.name,
        "Size:",
        documentFile.size
      );

      const customFileName = `${uuidv4()}`;

      // Initiate upload
      const { uploadId, key, presignedUrl } = await initiateUpload(
        customFileName,
        documentFile.size
      );

      let finalizeResult;

      if (documentFile.size < CHUNK_SIZE) {
        console.log("Performing single-part upload");
        // Single-part upload for small files
        await axios.put(presignedUrl, documentFile, {
          headers: { "Content-Type": documentFile.type },
        });
        finalizeResult = { success: true };
      } else {
        console.log("Performing multipart upload");
        // Multipart upload for large files
        const chunks = Math.ceil(documentFile.size / CHUNK_SIZE);
        const partNumbers = Array.from({ length: chunks }, (_, i) => i + 1);
        const presignedUrls = await getPresignedUrls(
          uploadId,
          key,
          partNumbers
        );

        const parts = await Promise.all(
          presignedUrls.map(async ({ partNumber, signedUrl }, index) => {
            const start = index * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, documentFile.size);
            const chunk = documentFile.slice(start, end);
            const etag = await uploadPart(signedUrl, chunk, partNumber);
            return { PartNumber: partNumber, ETag: etag };
          })
        );

        console.log("All parts uploaded, parts array:", parts);

        // Finalize multipart upload
        finalizeResult = await finalizeMultipartUpload(uploadId, key, parts);
      }

      if (finalizeResult.success) {
        console.log("Upload finalized successfully");
        const documentUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;

        console.log({ documentUrl });

        if (documentUrl) {
          try {
            const requestData = {
              pdf_url: documentUrl,
              email: email,
            };

            const { data } = await axios.post(
              "https://1eop66zpf7.execute-api.ap-south-1.amazonaws.com/prod/process-pdf",
              requestData
            );

            console.log("API Response:", data);

            reset();
            setFormSubmitting(false);
            toast.success(
              "Success. Wait for email..."
            );
          } catch (error) {
            console.error("Error calling API:", error);
            throw new Error("Failed to process document. Please try again.");
          }
        }
      } else throw new Error("Failed to upload file. Please try again.");
    } catch (err) {
      console.error("Error in onSubmit:", err);
      setFormSubmitting(false);
      toast.error(err.message);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="text-2xl font-bold text-center pt-10">
        Upload your files
      </div>
      <div className="mt-10 max-w-screen-lg mx-auto">
        <div className="border-none rounded-none">
          <Form {...form}>
            <form
              className="flex flex-col gap-5 max-w-md mx-auto font-inter"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {/* Email */}

              <FormFieldCustom
                control={form.control}
                name="email"
                label={"Email Name*"}
              >
                {(field) => <FormInput placeholder="Email" field={field} />}
              </FormFieldCustom>

              {/* Document File Upload */}
              <FormFieldCustom
                control={form.control}
                name="file"
                label={"Document File*"}
              >
                {() => (
                  <FormInputFile
                    accept=".pdf"
                    // accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    placeholder="Upload Document"
                    form={form}
                  />
                )}
              </FormFieldCustom>

              <button
                disabled={isFormSubmitting}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
