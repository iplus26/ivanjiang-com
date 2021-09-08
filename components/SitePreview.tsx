import { useState } from "react"
import { SitePreviewResult } from "../pages/api/site-preview";
import styles from './SitePreview.module.css';

export const SitePreview = () => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [img, setImg] = useState('');
    const [url, setUrl] = useState('');

    const fetchInfo = async () => {
        if (!url) {
            return;
        }

        try {
            const resp: SitePreviewResult = await (await fetch('/api/site-preview?url=' + encodeURIComponent(url))).json();
            if (!resp.errMsg) {
                setTitle(resp.title);
                setDesc(resp.desc);
                setImg(resp.imgSrc);
                // setUrl(resp.url);
                return;
            }
        } catch (e) {
        }

        // Resets
        setTitle('');
        setDesc('');
        setImg('');
    }

    return (
        <>
            <label>
                Enter URL:&emsp;
                <input value={url} onChange={e => setUrl(e.target.value)} />
                <button onClick={fetchInfo}>Preview!</button>
            </label>
            <div className={styles.previewContainer}>
                <div className={styles.content}>
                    <p className={styles.title}>{title}</p>
                    <p className={styles.desc}>{desc}</p>
                </div>
                {
                    img && <div className={styles.thumbnail} style={{ backgroundImage: 'url(' + img + ')' }}></div>
                }
            </div>
        </>
    )
}