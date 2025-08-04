#!/usr/bin/env python3
"""
Script to extract text from PDF file and save it as a readable text file
"""

import pdfplumber
import PyPDF2
import os
import sys

def extract_text_with_pdfplumber(pdf_path, output_path):
    """Extract text using pdfplumber (better for complex layouts)"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text_content = []
            print(f"PDF has {len(pdf.pages)} pages")
            
            for i, page in enumerate(pdf.pages):
                print(f"Processing page {i+1}...")
                text = page.extract_text()
                if text:
                    text_content.append(f"\n--- PAGE {i+1} ---\n")
                    text_content.append(text)
                    text_content.append("\n" + "="*50 + "\n")
        
        full_text = "\n".join(text_content)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        
        print(f"Text extracted successfully to: {output_path}")
        return True
        
    except Exception as e:
        print(f"Error with pdfplumber: {e}")
        return False

def extract_text_with_pypdf2(pdf_path, output_path):
    """Extract text using PyPDF2 (fallback method)"""
    try:
        with open(pdf_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text_content = []
            
            print(f"PDF has {len(pdf_reader.pages)} pages")
            
            for i, page in enumerate(pdf_reader.pages):
                print(f"Processing page {i+1}...")
                text = page.extract_text()
                if text:
                    text_content.append(f"\n--- PAGE {i+1} ---\n")
                    text_content.append(text)
                    text_content.append("\n" + "="*50 + "\n")
        
        full_text = "\n".join(text_content)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        
        print(f"Text extracted successfully to: {output_path}")
        return True
        
    except Exception as e:
        print(f"Error with PyPDF2: {e}")
        return False

def main():
    pdf_filename = "PERWALI NO 2 TH 2017 EDITAN TERAKHIR TGL 12 APRIL 2017.pdf"
    output_filename = "PERWALI_NO_2_TH_2017_EXTRACTED_TEXT.txt"
    
    # Get current directory
    current_dir = os.getcwd()
    pdf_path = os.path.join(current_dir, pdf_filename)
    output_path = os.path.join(current_dir, output_filename)
    
    print(f"Looking for PDF at: {pdf_path}")
    
    if not os.path.exists(pdf_path):
        print(f"PDF file not found: {pdf_path}")
        return
    
    print("Attempting to extract text using pdfplumber...")
    success = extract_text_with_pdfplumber(pdf_path, output_path)
    
    if not success:
        print("pdfplumber failed, trying PyPDF2...")
        success = extract_text_with_pypdf2(pdf_path, output_path)
    
    if success:
        print(f"\nText extraction completed!")
        print(f"Output file: {output_path}")
        
        # Show file size for verification
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"Extracted text file size: {size} bytes")
    else:
        print("Both extraction methods failed.")

if __name__ == "__main__":
    main()
