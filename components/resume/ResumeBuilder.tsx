"use client";

import * as React from "react";
import { Download, GripVertical, Plus, Sparkles, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

import type { ResumeData } from "@/lib/resume";
import { defaultResume, newId } from "@/lib/resume";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { HarvardTemplate } from "@/components/resume/templates/HarvardTemplate";
import { ModernTemplate } from "@/components/resume/templates/ModernTemplate";
import { ClassicPhotoTemplate } from "@/components/resume/templates/ClassicPhotoTemplate";
import { Textarea } from "@/components/ui/textarea";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TemplateId = "harvard" | "modern" | "classic-photo";
type BulletPresetId = "impact" | "leadership" | "ownership";

const templateMeta: Record<
  TemplateId,
  { label: string; description: string }
> = {
  harvard: { label: "Harvard", description: "Classic, minimal, ATS-friendly" },
  modern: { label: "Modern", description: "Contemporary cards + clean layout" },
  "classic-photo": {
    label: "Classic",
    description: "Traditional layout with optional photo on the right",
  },
};

const bulletPresets: Record<BulletPresetId, string> = {
  impact: "Increased X by Y% by doing Z, improving A metric for B users.",
  leadership:
    "Led a team of N to deliver X on time, coordinating with stakeholders and resolving blockers.",
  ownership:
    "Owned end-to-end delivery of X from design to production, monitoring metrics and iterating.",
};

function A4Frame({
  children,
  rootRef,
}: {
  children: React.ReactNode;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-full rounded-xl bg-muted p-2 sm:p-4">
        <div
          ref={rootRef}
          className="mx-auto w-full max-w-[794px] shadow-sm"
          style={{
            minHeight: 1123,
            background: "white",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ExportFrame({
  children,
  rootRef,
}: {
  children: React.ReactNode;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="pointer-events-none absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <div
        ref={rootRef}
        style={{
          width: 794,
          minHeight: 1123,
          background: "white",
        }}
      >
        {children}
      </div>
    </div>
  );
}

async function downloadPdfFromElement(el: HTMLElement, filename: string) {
  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(dataUrl);
  const imgW = imgProps.width;
  const imgH = imgProps.height;
  const scale = Math.min(pageW / imgW, pageH / imgH);
  const renderW = imgW * scale;
  const renderH = imgH * scale;
  const x = (pageW - renderW) / 2;
  const y = (pageH - renderH) / 2;

  pdf.addImage(dataUrl, "PNG", x, y, renderW, renderH);
  pdf.save(filename);
}

type SortableItemProps = React.PropsWithChildren<{ id: string }>;

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-2 inline-flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded border bg-background text-muted-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

function autoFormatBullets(input: string): string {
  return input
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      const withoutBullet = trimmed.replace(/^•\s*/, "");
      return `• ${withoutBullet}`;
    })
    .join("\n")
    .trimEnd();
}

export function ResumeBuilder() {
  const [data, setData] = React.useState<ResumeData>(defaultResume);
  const [template, setTemplate] = React.useState<TemplateId>("harvard");
  const [downloading, setDownloading] = React.useState(false);

  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const exportRef = React.useRef<HTMLDivElement | null>(null);

  const Template =
    template === "harvard"
      ? HarvardTemplate
      : template === "modern"
      ? ModernTemplate
      : ClassicPhotoTemplate;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  async function onDownload() {
    if (!exportRef.current) return;
    try {
      setDownloading(true);
      const name = (data.basics.fullName || "resume")
        .trim()
        .replace(/\s+/g, "_");
      await downloadPdfFromElement(exportRef.current, `${name}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Resume Builder
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill the form, choose a template, preview instantly, then
                download as PDF.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-[220px]">
                <Select
                  value={template}
                  onValueChange={(v) => setTemplate(v as TemplateId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harvard">
                      {templateMeta.harvard.label}
                    </SelectItem>
                    <SelectItem value="modern">
                      {templateMeta.modern.label}
                    </SelectItem>
                    <SelectItem value="classic-photo">{templateMeta["classic-photo"].label}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-1 text-xs text-muted-foreground">
                  {templateMeta[template].description}
                </div>
              </div>
              <Button onClick={onDownload} disabled={downloading}>
                <Download />
                {downloading ? "Preparing..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
          <Card className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-10.5rem)] px-6 pb-6">
                <Tabs defaultValue="basics" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="basics">Basics</TabsTrigger>
                    <TabsTrigger value="experience">Work</TabsTrigger>
                    <TabsTrigger value="education">Edu</TabsTrigger>
                    <TabsTrigger value="certificates">Certs</TabsTrigger>
                    <TabsTrigger value="references">Refs</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basics" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full name</Label>
                        <Input
                          value={data.basics.fullName}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              basics: { ...d.basics, fullName: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Headline / Title</Label>
                        <Input
                          value={data.basics.title}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              basics: { ...d.basics, title: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={data.basics.email}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              basics: { ...d.basics, email: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={data.basics.phone}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              basics: { ...d.basics, phone: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={data.basics.location}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              basics: { ...d.basics, location: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                          value={data.basics.website}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              basics: { ...d.basics, website: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>LinkedIn</Label>
                        <Input
                          value={data.basics.linkedin}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              basics: { ...d.basics, linkedin: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Summary</Label>
                        <Textarea
                          value={data.basics.summary}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              basics: { ...d.basics, summary: e.target.value },
                            }))
                          }
                        />
                      </div>
                      {template === "classic-photo" && (
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Photo (optional)</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            className="cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) {
                                setData((d) => ({
                                  ...d,
                                  basics: { ...d.basics, photoUrl: "" },
                                }));
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const result = event.target?.result as
                                  | string
                                  | null;
                                if (!result) return;
                                setData((d) => ({
                                  ...d,
                                  basics: { ...d.basics, photoUrl: result },
                                }));
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Experience</div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            experience: [
                              ...d.experience,
                              {
                                id: newId("exp"),
                                company: "",
                                role: "",
                                location: "",
                                start: "",
                                end: "",
                                bullets: "",
                              },
                            ],
                          }))
                        }
                      >
                        <Plus />
                        Add
                      </Button>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => {
                        const { active, over } = event;
                        if (!over || active.id === over.id) return;
                        setData((d) => {
                          const oldIndex = d.experience.findIndex(
                            (x) => x.id === active.id
                          );
                          const newIndex = d.experience.findIndex(
                            (x) => x.id === over.id
                          );
                          if (oldIndex === -1 || newIndex === -1) return d;
                          return {
                            ...d,
                            experience: arrayMove(
                              d.experience,
                              oldIndex,
                              newIndex
                            ),
                          };
                        });
                      }}
                    >
                      <SortableContext
                        items={data.experience.map((e) => e.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {data.experience.map((e, idx) => (
                            <SortableItem key={e.id} id={e.id}>
                              <Card className="shadow-none">
                                <CardContent className="space-y-3 pt-6">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-medium">
                                      Role #{idx + 1}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        setData((d) => ({
                                          ...d,
                                          experience: d.experience.filter(
                                            (x) => x.id !== e.id
                                          ),
                                        }))
                                      }
                                      aria-label="Remove experience"
                                    >
                                      <Trash2 />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label>Company</Label>
                                      <Input
                                        value={e.company}
                                        maxLength={64}
                                        onChange={(ev) =>
                                          setData((d) => ({
                                            ...d,
                                            experience: d.experience.map((x) =>
                                              x.id === e.id
                                                ? {
                                                    ...x,
                                                    company: ev.target.value,
                                                  }
                                                : x
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Role</Label>
                                      <Input
                                        value={e.role}
                                        maxLength={80}
                                        onChange={(ev) =>
                                          setData((d) => ({
                                            ...d,
                                            experience: d.experience.map((x) =>
                                              x.id === e.id
                                                ? { ...x, role: ev.target.value }
                                                : x
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Location</Label>
                                      <Input
                                        value={e.location}
                                        onChange={(ev) =>
                                          setData((d) => ({
                                            ...d,
                                            experience: d.experience.map((x) =>
                                              x.id === e.id
                                                ? {
                                                    ...x,
                                                    location: ev.target.value,
                                                  }
                                                : x
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label>Start</Label>
                                        <Input
                                          value={e.start}
                                          onChange={(ev) =>
                                            setData((d) => ({
                                              ...d,
                                              experience: d.experience.map(
                                                (x) =>
                                                  x.id === e.id
                                                    ? {
                                                        ...x,
                                                        start: ev.target.value,
                                                      }
                                                    : x
                                              ),
                                            }))
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>End</Label>
                                        <Input
                                          value={e.end}
                                          onChange={(ev) =>
                                            setData((d) => ({
                                              ...d,
                                              experience: d.experience.map(
                                                (x) =>
                                                  x.id === e.id
                                                    ? {
                                                        ...x,
                                                        end: ev.target.value,
                                                      }
                                                    : x
                                              ),
                                            }))
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <Label>Bullets (one per line)</Label>
                                        <Select
                                          onValueChange={(preset) => {
                                            const text =
                                              bulletPresets[
                                                preset as BulletPresetId
                                              ];
                                            setData((d) => ({
                                              ...d,
                                              experience: d.experience.map(
                                                (x) =>
                                                  x.id === e.id
                                                    ? {
                                                        ...x,
                                                        bullets:
                                                          autoFormatBullets(
                                                            `${x.bullets || ""}${
                                                              x.bullets
                                                                ? "\n"
                                                                : ""
                                                            }${text}`
                                                          ),
                                                      }
                                                    : x
                                              ),
                                            }));
                                          }}
                                        >
                                          <SelectTrigger className="h-8 w-[160px] text-xs">
                                            <SelectValue placeholder="Smart bullet" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="impact">
                                              Impact bullet
                                            </SelectItem>
                                            <SelectItem value="leadership">
                                              Leadership bullet
                                            </SelectItem>
                                            <SelectItem value="ownership">
                                              Ownership bullet
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Textarea
                                        value={e.bullets}
                                        onChange={(ev) =>
                                          setData((d) => ({
                                            ...d,
                                            experience: d.experience.map((x) =>
                                              x.id === e.id
                                                ? {
                                                    ...x,
                                                    bullets: ev.target.value,
                                                  }
                                                : x
                                            ),
                                          }))
                                        }
                                        onBlur={(ev) =>
                                          setData((d) => ({
                                            ...d,
                                            experience: d.experience.map((x) =>
                                              x.id === e.id
                                                ? {
                                                    ...x,
                                                    bullets: autoFormatBullets(
                                                      ev.target.value
                                                    ),
                                                  }
                                                : x
                                            ),
                                          }))
                                        }
                                        placeholder={
                                          "• Built X...\n• Improved Y...\n• Led Z..."
                                        }
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Education</div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            education: [
                              ...d.education,
                              {
                                id: newId("edu"),
                                school: "",
                                degree: "",
                                location: "",
                                start: "",
                                end: "",
                                details: "",
                              },
                            ],
                          }))
                        }
                      >
                        <Plus />
                        Add
                      </Button>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => {
                        const { active, over } = event;
                        if (!over || active.id === over.id) return;
                        setData((d) => {
                          const oldIndex = d.education.findIndex(
                            (x) => x.id === active.id
                          );
                          const newIndex = d.education.findIndex(
                            (x) => x.id === over.id
                          );
                          if (oldIndex === -1 || newIndex === -1) return d;
                          return {
                            ...d,
                            education: arrayMove(d.education, oldIndex, newIndex),
                          };
                        });
                      }}
                    >
                      <SortableContext
                        items={data.education.map((ed) => ed.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {data.education.map((ed, idx) => (
                            <SortableItem key={ed.id} id={ed.id}>
                              <Card className="shadow-none">
                                <CardContent className="space-y-3 pt-6">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-medium">
                                      School #{idx + 1}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        setData((d) => ({
                                          ...d,
                                          education: d.education.filter(
                                            (x) => x.id !== ed.id
                                          ),
                                        }))
                                      }
                                      aria-label="Remove education"
                                    >
                                      <Trash2 />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label>School</Label>
                                      <Input
                                        value={ed.school}
                                        onChange={(ev) =>
                                          setData((d) => ({
                                            ...d,
                                            education: d.education.map((x) =>
                                              x.id === ed.id
                                                ? { ...x, school: ev.target.value }
                                                : x
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Degree</Label>
                                      <Input
                                        value={ed.degree}
                                        onChange={(ev) =>
                                          setData((d) => ({
                                            ...d,
                                            education: d.education.map((x) =>
                                              x.id === ed.id
                                                ? { ...x, degree: ev.target.value }
                                                : x
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Location</Label>
                                      <Input
                                        value={ed.location}
                                        onChange={(ev) =>
                                          setData((d) => ({
                                            ...d,
                                            education: d.education.map((x) =>
                                              x.id === ed.id
                                                ? {
                                                    ...x,
                                                    location: ev.target.value,
                                                  }
                                                : x
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label>Start</Label>
                                        <Input
                                          value={ed.start}
                                          onChange={(ev) =>
                                            setData((d) => ({
                                              ...d,
                                              education: d.education.map((x) =>
                                                x.id === ed.id
                                                  ? {
                                                      ...x,
                                                      start: ev.target.value,
                                                    }
                                                  : x
                                              ),
                                            }))
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>End</Label>
                                        <Input
                                          value={ed.end}
                                          onChange={(ev) =>
                                            setData((d) => ({
                                              ...d,
                                              education: d.education.map((x) =>
                                                x.id === ed.id
                                                  ? {
                                                      ...x,
                                                      end: ev.target.value,
                                                    }
                                                  : x
                                              ),
                                            }))
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                      <Label>Details</Label>
                                      <Textarea
                                        value={ed.details}
                                        onChange={(ev) =>
                                          setData((d) => ({
                                            ...d,
                                            education: d.education.map((x) =>
                                              x.id === ed.id
                                                ? { ...x, details: ev.target.value }
                                                : x
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </TabsContent>

                  <TabsContent value="certificates" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Certificates</div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            certificates: [
                              ...d.certificates,
                              {
                                id: newId("cert"),
                                name: "",
                                issuer: "",
                                date: "",
                                link: "",
                                details: "",
                              },
                            ],
                          }))
                        }
                      >
                        <Plus />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {data.certificates.map((c, idx) => (
                        <Card key={c.id} className="shadow-none">
                          <CardContent className="space-y-3 pt-6">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-medium">
                                Certificate #{idx + 1}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setData((d) => ({
                                    ...d,
                                    certificates: d.certificates.filter(
                                      (x) => x.id !== c.id
                                    ),
                                  }))
                                }
                                aria-label="Remove certificate"
                              >
                                <Trash2 />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={c.name}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      certificates: d.certificates.map((x) =>
                                        x.id === c.id
                                          ? { ...x, name: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Issuer</Label>
                                <Input
                                  value={c.issuer}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      certificates: d.certificates.map((x) =>
                                        x.id === c.id
                                          ? { ...x, issuer: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                  value={c.date}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      certificates: d.certificates.map((x) =>
                                        x.id === c.id
                                          ? { ...x, date: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Link (optional)</Label>
                                <Input
                                  value={c.link}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      certificates: d.certificates.map((x) =>
                                        x.id === c.id
                                          ? { ...x, link: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2 sm:col-span-2">
                                <Label>Details</Label>
                                <Textarea
                                  value={c.details}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      certificates: d.certificates.map((x) =>
                                        x.id === c.id
                                          ? { ...x, details: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="references" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">References</div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            references: [
                              ...d.references,
                              {
                                id: newId("ref"),
                                name: "",
                                relationship: "",
                                email: "",
                                phone: "",
                                details: "",
                              },
                            ],
                          }))
                        }
                      >
                        <Plus />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {(data.references ?? []).map((r, idx) => (
                        <Card key={r.id} className="shadow-none">
                          <CardContent className="space-y-3 pt-6">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-medium">
                                Reference #{idx + 1}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setData((d) => ({
                                    ...d,
                                    references: d.references.filter(
                                      (x) => x.id !== r.id
                                    ),
                                  }))
                                }
                                aria-label="Remove reference"
                              >
                                <Trash2 />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={r.name}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      references: d.references.map((x) =>
                                        x.id === r.id
                                          ? { ...x, name: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Relationship</Label>
                                <Input
                                  value={r.relationship}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      references: d.references.map((x) =>
                                        x.id === r.id
                                          ? { ...x, relationship: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  value={r.email}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      references: d.references.map((x) =>
                                        x.id === r.id
                                          ? { ...x, email: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                  value={r.phone}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      references: d.references.map((x) =>
                                        x.id === r.id
                                          ? { ...x, phone: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2 sm:col-span-2">
                                <Label>Details (optional)</Label>
                                <Textarea
                                  value={r.details}
                                  onChange={(ev) =>
                                    setData((d) => ({
                                      ...d,
                                      references: d.references.map((x) =>
                                        x.id === r.id
                                          ? { ...x, details: ev.target.value }
                                          : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Skills (comma separated)</Label>
                      <Textarea
                        value={data.skills}
                        onChange={(e) =>
                          setData((d) => ({ ...d, skills: e.target.value }))
                        }
                        className="min-h-[160px]"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Preview</div>
                <div className="text-xs text-muted-foreground">
                  This is what will be exported to PDF.
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setData(defaultResume)}
                className="hidden sm:inline-flex"
              >
                Reset demo data
              </Button>
            </div>

            <A4Frame rootRef={previewRef}>
              <Template data={data} />
            </A4Frame>

            <ExportFrame rootRef={exportRef}>
              <Template data={data} />
            </ExportFrame>
          </div>
        </div>
      </div>
    </div>
  );
}


