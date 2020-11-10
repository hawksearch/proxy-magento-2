<?php
/**
 * Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

declare(strict_types=1);

namespace HawkSearch\Proxy\Plugin;

use Magento\CatalogSearch\Block\Result;
use Magento\Framework\Phrase;
use Magento\Search\Model\QueryFactory;

class ResultBlockPlugin
{
    /**
     * @var QueryFactory
     */
    private $queryFactory;

    /**
     * ResultBlockPlugin constructor.
     * @param QueryFactory $queryFactory
     */
    public function __construct(
        QueryFactory $queryFactory
    ) {
        $this->queryFactory = $queryFactory;
    }

    /**
     * @param Result $subject
     * @param Phrase $result
     * @return Phrase
     */
    public function afterGetSearchQueryText(Result $subject, Phrase $result)
    {
        if ($this->queryFactory->get()->getQueryText() == '') {
            return __("All Items");
        }
        return $result;
    }
}
