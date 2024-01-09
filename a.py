import os
import sys
from PyPDF2 import PdfReader
import docx


from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from langchain.callbacks import get_openai_callback

# query = sys.argv[1]

# ############ TEXT LOADERS ############
#  # Functions to read different file types
# def read_pdf(file_path):
#         with open(file_path, "rb") as file:
#             pdf_reader = PdfReader(file)
#             text = ""
#             for page_num in range(len(pdf_reader.pages)):
#                 text += pdf_reader.pages[page_num].extract_text()
#         return text

# def read_word(file_path):
#         doc = docx.Document(file_path)
#         text = ""
#         for paragraph in doc.paragraphs:
#             text += paragraph.text + "\n"
#         return text

# def read_txt(file_path):
#         with open(file_path, "r") as file:
#             text = file.read()
#         return text

# def read_documents_from_directory(directory):
#         combined_text = ""
#         for filename in os.listdir(directory):
#             file_path = os.path.join(directory, filename)
#             if filename.endswith(".pdf"):
#                 combined_text += read_pdf(file_path)
#             elif filename.endswith(".docx"):
#                 combined_text += read_word(file_path)
#             elif filename.endswith(".txt"):
#                 combined_text += read_txt(file_path)
#         return combined_text

#     ###############################################

# train_directory = './files'
# text = read_documents_from_directory(train_directory)


#     # split into chunks
# char_text_splitter = CharacterTextSplitter(separator="\n", chunk_size=1000,
#                                         chunk_overlap=200, length_function=len)

# text_chunks = char_text_splitter.split_text(text)

#     # create embeddings
# embeddings = OpenAIEmbeddings(openai_api_key = "")
# docsearch = FAISS.from_texts(text_chunks, embeddings)


# llm = OpenAI(openai_api_key = "")
# chain = load_qa_chain(llm, chain_type="map_rerank")

# docs = docsearch.similarity_search(query )

# response = chain.run(input_documents=docs, question=query )

# print(response)


import openai
# from getpass import getpass
openai.api_key = ""

import base64

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

import textwrap
def get_text_image(file_path):
    image_path = file_path
    encoded_image = encode_image(image_path)
    result = openai.chat.completions.create(
        model = "gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text",
                    "text": "Can you please tell me what is displayed on this image?"},
                    {"type": "image_url",
                    "image_url": f"data:image/jpeg;base64,{encoded_image}"},
                ]
            },
        ],
        max_tokens=300
    )


    return (textwrap.fill(result.choices[0].message.content, width=70))



import PIL # Assuming you're using PyMuPDF for reading PDFs
import io
def read_pdf(file_path):
    with open(file_path, "rb") as file:
        pdf_reader = PdfReader(file)
        text = ""
        images = []

        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            count = 0
            if hasattr(page, "images"):
                for image_file_object in page.images:
                    image_data = image_file_object.data
                    
                    # Optimize image size and quality
                    with PIL.Image.open(io.BytesIO(image_data)) as image:
                        image = image.convert("RGB")  # Convert to RGB for compression
                        image = image.resize((400, 300), PIL.Image.LANCZOS)  # Adjust dimensions (example)
                        image_data = io.BytesIO()
                        image.save(image_data, format="JPEG", quality=80)  # Adjust format and quality

                    image_path = f"./images/{page_num}_{str(count)}.jpg"  # Adjust format in path
                    with open(image_path, "wb") as fp:
                        fp.write(image_data.getvalue())
                        
                    
                    count += 1
                    
            else:
                print(f"Warning: Image extraction not supported on page {page_num}.")

            text += page.extract_text()



read_pdf('/Users/nitin/coding/Projects/Assembly/guide_3.pdf')