'use client'

import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon
} from 'react-share'

interface ShareButtonsProps {
  url?: string
  title: string
  description?: string
  size?: number
}

export default function ShareButtons({ 
  url = typeof window !== 'undefined' ? window.location.href : '',
  title,
  description = '',
  size = 32
}: ShareButtonsProps) {
  return (
    <div className="flex gap-2">
      <FacebookShareButton url={url} title={title}>
        <FacebookIcon size={size} round />
      </FacebookShareButton>
      
      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={size} round />
      </TwitterShareButton>
      
      <LinkedinShareButton url={url} title={title} summary={description}>
        <LinkedinIcon size={size} round />
      </LinkedinShareButton>
      
      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={size} round />
      </WhatsappShareButton>
      
      <EmailShareButton url={url} subject={title} body={description}>
        <EmailIcon size={size} round />
      </EmailShareButton>
    </div>
  )
}