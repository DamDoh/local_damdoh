
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FarmManagementPage() {
  const t = useTranslations('FarmManagement');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        {t('description')}
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Card for Managing Farms */}
        <Card>
          <CardHeader>
            <CardTitle>{t('myFarms.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('myFarms.description')}</p>
            <Link href="/farm-management/create-farm" passHref>
              <Button>{t('myFarms.button')}</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card for Crop Cycle Management */}
        <Card>
          <CardHeader>
            <CardTitle>{t('cropCycle.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('cropCycle.description')}</p>
            <Button disabled>{t('cropCycle.button')}</Button>
          </CardContent>
        </Card>

        {/* Card for KNF & Sustainable Practices */}
        <Card>
          <CardHeader>
            <CardTitle>{t('knf.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('knf.description')}</p>
             <Link href="/farm-management/knf-inputs" passHref>
               <Button>{t('knf.button')}</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card for Asset Management */}
        <Card>
          <CardHeader>
            <CardTitle>{t('assetManagement.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('assetManagement.description')}</p>
            <Button disabled>{t('assetManagement.button')}</Button>
          </CardContent>
        </Card>
        
        {/* Card for Financials */}
        <Card>
          <CardHeader>
            <CardTitle>{t('financials.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('financials.description')}</p>
            <Link href="/farm-management/financials" passHref>
              <Button>{t('financials.button')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
