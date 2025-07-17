
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sprout, ArrowLeft, Leaf, Package, Sun, CheckCircle, AlertTriangle, Lightbulb, Grid } from "lucide-react";
import React from "react";
import parse, { DOMNode, domToReact, HTMLReactParserOptions } from 'html-react-parser';
import { useTranslations } from "next-intl";

interface Section {
  id: string;
  title: string;
  icon: React.ReactElement;
  intro: string;
  points?: { term: string; def: string }[];
  steps?: string[];
}

export default function SeedStartingPage() {
  const t = useTranslations('farmManagement.seedStartingPage');

  // Options for html-react-parser to allow only a safe subset of HTML
  const parseOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      // Only allow known safe tags
      if (domNode.type === 'tag') {
        const element = domNode as unknown as Element; // Cast for tag-specific properties
        switch (element.tagName) {
          case 'strong':
          case 'em':
          case 'ul':
          case 'ol':
          case 'li':
          case 'br':
            // Allow these tags and their children
            return undefined;
          default:
            // Strip out all other tags, render their children
            return <React.Fragment>{domToReact(element.children as DOMNode[], parseOptions)}</React.Fragment>;
        }
      }
      // Keep text nodes and other non-tag nodes
      return undefined;
    },
  };

  const sections: Section[] = t.tm('sections');

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('backLink')}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
          </div>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('intro')}
          </p>
          <Accordion type="single" collapsible className="w-full" defaultValue="why-start-indoors">
            {sections.map((section) => (
              <AccordionItem value={section.id} key={section.id}>
                <AccordionTrigger className="text-lg hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    {section.icon && React.createElement(
                        { 'Lightbulb': Lightbulb, 'Package': Package, 'Grid': Grid, 'Leaf': Leaf, 'Sun': Sun, 'CheckCircle': CheckCircle, 'AlertTriangle': AlertTriangle }[section.icon as any] || Sprout, 
                        { className: "h-5 w-5 text-primary" }
                    )}
                    {section.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-4">
                  <p className="text-muted-foreground">{section.intro}</p>
                  {section.points && (
                    <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
                      {section.points.map((point, index) => (
                        <li key={index}><strong className="font-medium">{point.term}:</strong> {point.def}</li>
                      ))}
                    </ul>
                  )}
                  {section.steps && (
                     <ol className="list-decimal list-inside text-muted-foreground space-y-3 pl-5">
                       {section.steps.map((step, index) => (
                         <li key={index}>{parse(step, parseOptions)}</li>
                       ))}
                     </ol>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
