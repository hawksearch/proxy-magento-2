<?php
/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */


namespace HawkSearch\Proxy\Plugin;

use Magento\Catalog\Helper\Data as ProxyHelper;

class BreadcrumbPlugin
{
    /**
     * @param ProxyHelper $subject
     * @param callable $proceed
     * @return mixed
     */
    public function aroundGetBreadcrumbPath(ProxyHelper $subject, callable $proceed)
    {
        $category = $subject->getCategory();
        if ($category && $category->getData('hawksearch_landing_page')) {
            return $category->getData('hawk_breadcrumb_path');
        }
        return $proceed();
    }
}
