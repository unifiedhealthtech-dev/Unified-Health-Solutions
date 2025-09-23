// src/components/ui/ProductRow.jsx
import { useState } from "react";
import { Button } from "./button"; // Adjust path if needed
import { Badge } from "./badge"; // Adjust path if needed
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"; // Adjust path if needed
import { Edit, Trash2 } from "lucide-react"; // Import icons
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'; // Import icons for trend

// --- Helper functions ---
const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

const getStatusBadge = (status, expiryDate) => {
  if (isExpired(expiryDate)) return "destructive";
  const variants = {
    'In Stock': "default",
    'Low Stock': "secondary",
    'Critical': "destructive",
  };
  return variants[status] || "secondary";
};

const getStockTrend = (current, min) => {
  const percentage = (current / min) * 100;
  if (percentage > 150) return { icon: TrendingUp, color: 'text-green-600', text: 'Good' };
  if (percentage > 100) return { icon: TrendingUp, color: 'text-blue-600', text: 'Normal' };
  if (percentage > 50) return { icon: TrendingDown, color: 'text-orange-500', text: 'Low' };
  return { icon: AlertTriangle, color: 'text-red-600', text: 'Critical' };
};

// --- Main Component ---
// Expects: product (object), batches (array of stock items for this product), onEdit (function), onDelete (function)
function ProductRow({ product, batches, onEdit, onDelete }) {
  const [open, setOpen] = useState(false); // State for dialog

  // --- Calculate overall product summary ---
  const totalCurrentStock = batches.reduce((sum, b) => sum + (b.current_stock || 0), 0);
  const totalMinimumStock = batches.reduce((sum, b) => sum + (b.minimum_stock || 0), 0);
  // Overall status: Expired > Critical > Low Stock > In Stock
  const overallStatus = batches.some(b => isExpired(b.expiry_date)) ? 'Expired' :
                        batches.some(b => b.status === 'Critical') ? 'Critical' :
                        batches.some(b => b.status === 'Low Stock') ? 'Low Stock' : 'In Stock';
  const overallTrend = getStockTrend(totalCurrentStock, totalMinimumStock);
  const OverallTrendIcon = overallTrend.icon;

  return (
    <>
      {/* Main Product Row */}
      <tr className="align-top border-b hover:bg-gray-50">
        {/* Product Details Column */}
        <td className="p-3 align-top">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{product.product_code || 'N/A'}</span>
            </div>
            <p className="font-medium">{product.generic_name || 'N/A'}</p>
            <div className="text-sm text-muted-foreground">
              HSN: {product.hsn_code || 'N/A'} | {product.unit_size || 'N/A'}
            </div>
            <Badge variant="outline" className="text-xs">
              {product.category || 'N/A'}
            </Badge>
          </div>
        </td>

        {/* Batches Column (shows count and view button) */}
        <td className="p-3 text-right align-top">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                View {batches.length} Batches
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
              <DialogHeader className="shrink-0">
                <DialogTitle>
                  Batches for {product.generic_name} ({product.product_code})
                </DialogTitle>
              </DialogHeader>
              <div className="flex-grow py-2 overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead className="sticky top-0 z-10 bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 border">Batch No</th>
                        <th className="px-3 py-2 border">Mfg Date</th>
                        <th className="px-3 py-2 border">Exp Date</th>
                        <th className="px-3 py-2 border">Qty</th>
                        <th className="px-3 py-2 border">Status</th>
                        <th className="px-3 py-2 border">Trend</th>
                        <th className="px-3 py-2 text-right border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((batch) => {
                        const batchTrend = getStockTrend(batch.current_stock, batch.minimum_stock);
                        const BatchTrendIcon = batchTrend.icon;
                        return (
                          <tr key={batch.stock_id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 border">{batch.batch_number || 'N/A'}</td>
                            <td className="px-3 py-2 border">
                              {batch.manufacturing_date ? new Date(batch.manufacturing_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-3 py-2 border">
                              <span className={isExpired(batch.expiry_date) ? "text-red-600 font-semibold" : ""}>
                                {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}
                                {isExpired(batch.expiry_date) && " (Expired)"}
                              </span>
                            </td>
                            <td className="px-3 py-2 border">{batch.current_stock ?? 'N/A'}</td>
                            <td className="px-3 py-2 border">
                              <Badge variant={getStatusBadge(batch.status, batch.expiry_date)}>
                                {isExpired(batch.expiry_date) ? "Expired" : batch.status}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 border">
                              <div className="flex items-center gap-1">
                                <BatchTrendIcon className={`h-3 w-3 ${batchTrend.color}`} />
                                <span className={`text-xs ${batchTrend.color}`}>
                                  {batchTrend.text}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right border">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Edit Batch"
                                  onClick={() => onEdit && onEdit(batch)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  title="Delete Batch"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete && onDelete(batch.stock_id);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="pt-3 mt-4 border-t shrink-0">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <Badge variant={getStatusBadge(overallStatus, null)}>
                      Overall Status: {overallStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <OverallTrendIcon className={`h-4 w-4 ${overallTrend.color}`} />
                    <span className={`font-medium ${overallTrend.color}`}>
                      Overall Trend: {overallTrend.text}
                    </span>
                    <span className="text-muted-foreground">
                      (Total: {totalCurrentStock} / Min: {totalMinimumStock})
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </td>
      </tr>
    </>
  );
}

export default ProductRow;