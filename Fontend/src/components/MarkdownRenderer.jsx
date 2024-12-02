import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownRenderer.css';

const MarkdownRenderer = ({ fileUrl }) => {
    const [markdownContent, setMarkdownContent] = useState('');

    useEffect(() => {
        const fetchMarkdown = async () => {
            try {
                const response = await fetch(fileUrl);
                const content = await response.text();
                setMarkdownContent(content);
            } catch (error) {
                console.error('Error loading Markdown file:', error);
            }
        };

        fetchMarkdown();
    }, [fileUrl]);

    return (
        <div className="markdown-container">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdownContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
