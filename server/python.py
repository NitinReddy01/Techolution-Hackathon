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

query = sys.argv[1]

############ TEXT LOADERS ############
 # Functions to read different file types
def read_pdf(file_path):
        with open(file_path, "rb") as file:
            pdf_reader = PdfReader(file)
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                text += pdf_reader.pages[page_num].extract_text()
        return text

def read_word(file_path):
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text

def read_txt(file_path):
        with open(file_path, "r") as file:
            text = file.read()
        return text

def read_documents_from_directory(directory):
        combined_text = ""
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            if filename.endswith(".pdf"):
                combined_text += read_pdf(file_path)
            # elif filename.endswith(".docx"):
            #     combined_text += read_word(file_path)
            # elif filename.endswith(".txt"):
            #     combined_text += read_txt(file_path)
        return combined_text

    ###############################################

train_directory = './files'
text = read_documents_from_directory(train_directory)


    # split into chunks
char_text_splitter = CharacterTextSplitter(separator="\n", chunk_size=1000,
                                        chunk_overlap=200, length_function=len)

text_chunks = char_text_splitter.split_text(text)

    # create embeddings
embeddings = OpenAIEmbeddings(openai_api_key = "")
docsearch = FAISS.from_texts(text_chunks, embeddings)


llm = OpenAI(openai_api_key = "")
chain = load_qa_chain(llm, chain_type="map_rerank")

docs = docsearch.similarity_search(query )

response = chain.run(input_documents=docs, question=query )

print(response)