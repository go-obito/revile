"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Post = { id: string; title: string; excerpt: string; tags: string; content: string; coverImage?: string; status: "draft" | "published" };

async function api<T>(url: string, options?: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  if (response.status === 401) { window.location.assign("/sign-in"); throw new Error("Unauthorized"); }
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || "Something went wrong."); }
  return response.json() as Promise<T>;
}

export default function WriterClient() {
  const router = useRouter();
  const editor = useRef<HTMLDivElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const selection = useRef<Range | null>(null);
  const [title, setTitle] = useState(""); const [excerpt, setExcerpt] = useState(""); const [tags, setTags] = useState("");
  const [postId, setPostId] = useState(""); const [status, setStatus] = useState<"draft" | "published">("draft"); const [coverImage, setCoverImage] = useState("");
  const [error, setError] = useState(""); const [uploading, setUploading] = useState(false); const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => { const id = new URLSearchParams(window.location.search).get("id"); if (!id) return; api<Post>(`/api/admin/posts/${id}`).then((post) => { setPostId(post.id); setTitle(post.title); setExcerpt(post.excerpt); setTags(post.tags); setStatus(post.status); setCoverImage(post.coverImage || ""); if (editor.current) editor.current.innerHTML = post.content; }).catch((reason) => setError(reason.message)); }, []);

  function rememberSelection() { const current = window.getSelection(); if (current?.rangeCount && editor.current?.contains(current.anchorNode)) selection.current = current.getRangeAt(0).cloneRange(); }
  function command(name: string, value?: string) { editor.current?.focus(); document.execCommand(name, false, value); rememberSelection(); }
  function insertImage(url: string) { const image = document.createElement("img"); image.src = url; image.alt = ""; const range = selection.current; if (range && editor.current?.contains(range.commonAncestorContainer)) { range.deleteContents(); range.insertNode(image); range.setStartAfter(image); range.collapse(true); const current = window.getSelection(); current?.removeAllRanges(); current?.addRange(range); selection.current = range.cloneRange(); } else { editor.current?.append(image); } }
  async function upload(file: File) {
    const auth = await api<{ token: string; expire: number; signature: string; publicKey: string }>("/api/admin/imagekit-auth");
    const form = new FormData(); form.append("file", file); form.append("fileName", file.name); form.append("publicKey", auth.publicKey); form.append("token", auth.token); form.append("signature", auth.signature); form.append("expire", String(auth.expire)); form.append("folder", "/revile"); form.append("useUniqueFileName", "true");
    return new Promise<string>((resolve, reject) => { const request = new XMLHttpRequest(); request.open("POST", "https://upload.imagekit.io/api/v1/files/upload"); request.upload.onprogress = (event) => { if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100)); }; request.onerror = () => reject(new Error("The image upload could not reach ImageKit.")); request.onload = () => { let result: { url?: string; message?: string } = {}; try { result = JSON.parse(request.responseText); } catch { /* ImageKit returned an unreadable response. */ } if (request.status >= 200 && request.status < 300 && result.url) resolve(result.url); else reject(new Error(result.message || "ImageKit could not upload this image.")); }; request.send(form); });
  }
  async function addInlineImage(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; setError(""); setUploadProgress(0); setUploading(true); try { insertImage(await upload(file)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Image upload failed."); } finally { setUploading(false); } }
  async function addCoverImage(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; setError(""); setUploadProgress(0); setUploading(true); try { setCoverImage(await upload(file)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Image upload failed."); } finally { setUploading(false); } }
  async function save(nextStatus: "draft" | "published") { setError(""); const body = { title, excerpt, tags, coverImage, content: editor.current?.innerHTML || "", status: nextStatus }; try { await api(postId ? `/api/admin/posts/${postId}` : "/api/posts", { method: postId ? "PUT" : "POST", body: JSON.stringify(body) }); router.push("/admin"); router.refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save post."); } }

  return <div className="admin-shell"><aside className="admin-nav"><Link className="brand" href="/admin">revile<span>.</span></Link><nav><Link href="/admin">⌘ Dashboard</Link><Link href="/admin/write">✎ Write</Link><Link href="/">↗ View site</Link></nav></aside><section className="admin-content"><header className="writer-header writer-header-sticky"><div><Link href="/admin" className="back">← Dashboard</Link><p className="eyebrow">{postId ? "Editing post" : "New post"}</p></div><div className="writer-actions"><button className="ghost-button" disabled={uploading} onClick={() => save("draft")}>Save draft</button><button className="primary-button" disabled={uploading} onClick={() => save("published")}>{status === "published" ? "Update post" : "Publish"} <span>→</span></button></div></header><div className="writer"><input className="post-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this thought a title"/><div className="editor-toolbar"><button type="button" onClick={() => command("formatBlock", "h2")}>H</button><button type="button" onClick={() => command("bold")}><b>B</b></button><button type="button" onClick={() => command("italic")}><i>I</i></button><button type="button" onClick={() => command("insertUnorderedList")}>• List</button><button type="button" onClick={() => command("formatBlock", "blockquote")}>❝</button><button type="button" onClick={() => { const url = prompt("Link URL"); if (url) command("createLink", url); }}>↗ Link</button><button type="button" onMouseDown={(event) => { rememberSelection(); event.preventDefault(); }} onClick={() => imageInput.current?.click()} disabled={uploading}>{uploading ? `Uploading ${uploadProgress}%` : "▧ Upload image"}</button><input ref={imageInput} className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={addInlineImage}/></div><div ref={editor} className="rich-editor" contentEditable suppressContentEditableWarning data-placeholder="Start writing…" onKeyUp={rememberSelection} onMouseUp={rememberSelection} onInput={rememberSelection}/>{error && <p className="form-error">{error}</p>}<div className="post-settings"><label>Short excerpt<textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="A short introduction for your readers"/></label><label>Tags<input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Culture, Notes, Technology"/></label><label>Cover image<input ref={coverInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={addCoverImage}/><small>{uploading ? `Uploading ${uploadProgress}%…` : coverImage ? "Cover image uploaded to ImageKit." : "Choose an image to upload to ImageKit."}</small></label></div></div></section></div>;
}
