import fetch from 'isomorphic-unfetch';
import type { NextApiRequest, NextApiResponse } from 'next';
import parse5 from 'parse5';

export interface SitePreviewResult {
    title: string;
    desc: string;
    imgSrc: string;
    url: string;
    errMsg?: string;
}

export default async function (req: NextApiRequest, res: NextApiResponse<SitePreviewResult>) {
    if (!req.query.url || typeof req.query.url !== 'string') {
        res.status(400)
            .json({
                title: '',
                desc: '',
                imgSrc: '',
                url: '',
                errMsg: '`url` is required, and must be a string'
            });
        return;
    }

    const url = normalizeURL(req.query.url);

    let title = '';
    let desc = '';
    let imgSrc = '';
    try {
        const maybeHtml = await (await fetch(url, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        })).text();
        if (typeof maybeHtml !== 'string') {
            throw new Error('Response is not string');
        }
        const doc = parse5.parse(maybeHtml, {
            scriptingEnabled: false,
            sourceCodeLocationInfo: false,
        });
        const htmlEl = doc.childNodes.find(childNode => childNode.nodeName.toLowerCase() === 'html');
        if (!htmlEl || !('childNodes' in htmlEl)) {
            throw new Error('No html tag found in document');
        }
        const head = htmlEl.childNodes.find(childNode => childNode.nodeName.toLowerCase() === 'head');
        if (!head || !('childNodes' in head)) {
            throw new Error('No head tag found in html');
        }
        const titleEl = head.childNodes.find(childNode => childNode.nodeName.toLowerCase() === 'title');
        if (titleEl && 'childNodes' in titleEl) {
            if (titleEl.childNodes.length && 'value' in titleEl.childNodes[0]) {
                title = titleEl.childNodes[0].value;
            }
        }
        for (let childNode of head.childNodes) {
            if (childNode.nodeName.toLowerCase() === 'meta') {
                // Facebook share thumbnail
                if (getAttr(childNode, 'property')?.value === 'og:image') {
                    const imageSrc = getAttr(childNode, 'content')?.value
                    if (typeof imageSrc === 'string') {
                        imgSrc = imageSrc;
                    }
                    continue;
                }
                // Facebook share info
                if (getAttr(childNode, 'property')?.value === 'og:description') {
                    const content = getAttr(childNode, 'content')?.value;
                    if (typeof content === 'string') {
                        desc = content;
                    }
                    continue;
                }
                // Native HTML desciption
                if (getAttr(childNode, 'name')?.value === 'description') {
                    const content = getAttr(childNode, 'content')?.value
                    if (typeof content === 'string') {
                        desc = content;
                    }
                    continue;
                }
            }
        };

        if (!imgSrc) {
            const firstValidImage = dfs(htmlEl, (node) => {
                if (node.nodeName.toLowerCase() !== 'img') {
                    return false;
                }
                if (getAttr(node, 'src')?.value) {
                    return true;
                }
                return false;
            });
            if (firstValidImage) {
                imgSrc = getAttr(firstValidImage, 'src')?.value ?? '';
            }
        }

        if (imgSrc) {
            const parsedUrl = new URL(url);
            imgSrc = normalizeImgSrc(
                parsedUrl.protocol,
                parsedUrl.host, // `host` includes port while `hostname` does not.
                imgSrc
            );
        }
    } catch (e) {
        res.status(200).json({
            title,
            desc,
            url,
            imgSrc,
            errMsg: e instanceof Error ? e.name + ': ' + e.message : 'Unknown error when fetching'
        })
        return;
    }

    res.status(200).json({
        title,
        desc,
        url,
        imgSrc,
    })
}

function getAttr(childNode: parse5.ChildNode, attrName: string): parse5.Attribute | null {
    if (!('attrs' in childNode)) {
        return null;
    }
    return childNode.attrs.find(attr => attr.name === attrName) ?? null;
}

function dfs(node: parse5.ChildNode, assert: (node: parse5.ChildNode) => boolean): parse5.ChildNode | null {
    if (assert(node)) {
        return node;
    }
    if (!('childNodes' in node)) {
        return null;
    }
    let ret: parse5.ChildNode | null = null;
    for (let child of node.childNodes) {
        ret = dfs(child, assert);
        if (ret) {
            break;
        }
    }
    return ret;
}

function normalizeURL(input: string): string {
    if (input.startsWith('//')) {
        return `http:${input}`;
    }
    if (input.startsWith('https://') || input.startsWith('http://')) {
        return input;
    }
    return `http://${input}`;
}

function normalizeImgSrc(protocol: string, host: string, imgSrc: string): string {
    if (imgSrc.startsWith('https://') || imgSrc.startsWith('http://')) {
        return imgSrc;
    }
    if (imgSrc.startsWith('//')) {
        return `${protocol}${imgSrc}`;
    }
    if (imgSrc.startsWith('/')) {
        return `${protocol}//${host}${imgSrc}`;
    }
    return `${protocol}//${host}/${imgSrc}`;
}